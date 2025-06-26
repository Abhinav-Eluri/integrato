from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from django.conf import settings
from datetime import datetime, timedelta
import logging

from .models import Integration, CalendarEvent, EmailMessage, SyncLog
from .serializers import (
    IntegrationSerializer, CalendarEventSerializer, CalendarEventListSerializer,
    EmailMessageSerializer, EmailMessageListSerializer, SyncLogSerializer,
    IntegrationStatsSerializer, OAuthCallbackSerializer, ManualSyncSerializer
)
from .services import GoogleOAuthService, MicrosoftOAuthService, GitHubOAuthService, SlackOAuthService, CalendlyOAuthService, get_oauth_service

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def integration_list(request):
    """List user's integrations"""
    integrations = Integration.objects.filter(user=request.user)
    serializer = IntegrationSerializer(integrations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def integration_stats(request):
    """Get integration statistics for the user"""
    user_integrations = Integration.objects.filter(user=request.user)
    
    stats = {
        'total_integrations': user_integrations.count(),
        'connected_integrations': user_integrations.filter(status='connected').count(),
        'total_events': CalendarEvent.objects.filter(integration__user=request.user).count(),
        'total_emails': EmailMessage.objects.filter(integration__user=request.user).count(),
        'last_sync': user_integrations.filter(last_sync__isnull=False).order_by('-last_sync').first(),
        'providers': {}
    }
    
    # Get provider breakdown
    provider_stats = user_integrations.values('provider').annotate(count=Count('id'))
    for provider_stat in provider_stats:
        provider = provider_stat['provider']
        stats['providers'][provider] = {
            'count': provider_stat['count'],
            'connected': user_integrations.filter(provider=provider, status='connected').count()
        }
    
    # Get last sync time
    last_sync_integration = user_integrations.filter(last_sync__isnull=False).order_by('-last_sync').first()
    stats['last_sync'] = last_sync_integration.last_sync if last_sync_integration else None
    
    serializer = IntegrationStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_providers(request):
    """Get list of available integration providers"""
    providers = [
        {
            'id': 'google_calendar',
            'name': 'Google Calendar',
            'description': 'Sync your Google Calendar events',
            'icon': 'google',
            'type': 'calendar',
            'available': True
        },
        {
            'id': 'google_gmail',
            'name': 'Gmail',
            'description': 'Sync your Gmail messages',
            'icon': 'gmail',
            'type': 'email',
            'available': True
        },
        {
            'id': 'microsoft_calendar',
            'name': 'Microsoft Calendar',
            'description': 'Sync your Outlook Calendar events',
            'icon': 'microsoft',
            'type': 'calendar',
            'available': True
        },
        {
            'id': 'microsoft_outlook',
            'name': 'Microsoft Outlook',
            'description': 'Sync your Outlook email messages',
            'icon': 'outlook',
            'type': 'email',
            'available': True
        },
        {
            'id': 'github',
            'name': 'GitHub',
            'description': 'Sync repositories, issues, and pull requests',
            'icon': 'github',
            'type': 'development',
            'available': True
        },
        {
            'id': 'slack',
            'name': 'Slack',
            'description': 'Send notifications and manage channels',
            'icon': 'slack',
            'type': 'communication',
            'available': True
        },
        {
            'id': 'calendly',
            'name': 'Calendly',
            'description': 'Sync your scheduled meetings and events',
            'icon': 'calendly',
            'type': 'calendar',
            'available': True
        }
    ]
    
    return Response(providers)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def initiate_oauth(request):
    """Initiate OAuth flow for a provider"""
    provider = request.data.get('provider')
    
    if not provider:
        return Response({'error': 'Provider is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if provider is supported
    valid_providers = [choice[0] for choice in Integration.PROVIDER_CHOICES]
    if provider not in valid_providers:
        return Response({'error': 'Invalid provider'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate state parameter for security
        state = f"{request.user.id}:{provider}:{timezone.now().timestamp()}"
        
        # Get OAuth URL based on provider
        if provider.startswith('google_'):
            oauth_url = GoogleOAuthService.get_oauth_url(provider, state)
        elif provider.startswith('microsoft_'):
            oauth_url = MicrosoftOAuthService.get_oauth_url(provider, state)
        elif provider == 'github':
            oauth_url = GitHubOAuthService.get_oauth_url(provider, state)
        elif provider == 'slack':
            oauth_url = SlackOAuthService.get_oauth_url(provider, state)
        elif provider == 'calendly':
            oauth_url = CalendlyOAuthService.get_oauth_url(provider, state)
        else:
            return Response({'error': 'Provider not supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'oauth_url': oauth_url,
            'state': state
        })
        
    except Exception as e:
        logger.error(f"OAuth initiation failed for {provider}: {e}")
        return Response({'error': 'Failed to initiate OAuth'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def oauth_callback(request):
    """Handle OAuth callback and exchange code for tokens"""
    # Handle both GET (OAuth redirect) and POST requests
    if request.method == 'GET':
        # Extract data from query parameters for OAuth redirects
        data = {
            'code': request.GET.get('code'),
            'provider': request.GET.get('provider', 'calendly'),  # Default to calendly for now
            'state': request.GET.get('state')
        }
    else:
        # Handle POST requests with JSON data
        data = request.data
    
    serializer = OAuthCallbackSerializer(data=data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    code = serializer.validated_data['code']
    provider = serializer.validated_data['provider']
    state = serializer.validated_data.get('state')
    
    try:
        # Extract user ID from state parameter and get user
        if not state:
            return Response({'error': 'State parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        state_parts = state.split(':')
        if len(state_parts) < 2:
            return Response({'error': 'Invalid state parameter format'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = int(state_parts[0])
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange code for tokens
        if provider.startswith('google_'):
            token_data = GoogleOAuthService.exchange_code_for_tokens(code, provider)
        elif provider.startswith('microsoft_'):
            token_data = MicrosoftOAuthService.exchange_code_for_tokens(code, provider)
        elif provider == 'github':
            # GitHub service requires redirect_uri parameter
            redirect_uri = f"{settings.FRONTEND_URL}/integrations/callback"
            github_service = GitHubOAuthService(None)  # Temporary instance for token exchange
            token_data = github_service.exchange_code_for_tokens(code, redirect_uri)
        elif provider == 'slack':
            token_data = SlackOAuthService.exchange_code_for_tokens(code, provider)
        elif provider == 'calendly':
            token_data = CalendlyOAuthService.exchange_code_for_tokens(code, provider)
        else:
            return Response({'error': 'Provider not supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update integration
        integration, created = Integration.objects.get_or_create(
            user=user,
            provider=provider,
            defaults={'status': 'connected'}
        )
        
        # Store tokens
        integration.set_access_token(token_data['access_token'])
        if token_data.get('refresh_token'):
            integration.set_refresh_token(token_data['refresh_token'])
        
        # Set token expiration if provided, otherwise set to None (for tokens that don't expire)
        if token_data.get('expires_in'):
            integration.token_expires_at = timezone.now() + timedelta(seconds=token_data['expires_in'])
        else:
            integration.token_expires_at = None
        
        integration.status = 'connected'
        integration.sync_enabled = True
        
        # Get user info from provider
        oauth_service = get_oauth_service(integration)
        if hasattr(oauth_service, 'get_user_info'):
            user_info = oauth_service.get_user_info()
            if user_info:
                integration.provider_user_id = user_info.get('id')
                integration.provider_email = user_info.get('email')
        
        integration.save()
        
        # Start initial sync
        try:
            if provider.endswith('_calendar'):
                oauth_service.sync_calendar_events()
            elif provider.endswith('_gmail'):
                oauth_service.sync_gmail_messages()
        except Exception as sync_error:
            logger.warning(f"Initial sync failed for {integration}: {sync_error}")
        
        # Return JSON response for API calls, redirect for browser requests
        if request.content_type == 'application/json' or 'application/json' in request.META.get('HTTP_ACCEPT', ''):
            # API request - return JSON response
            return Response({
                'integration': IntegrationSerializer(integration).data,
                'message': 'Integration connected successfully'
            }, status=status.HTTP_200_OK)
        else:
            # Browser request - redirect to frontend
            from django.shortcuts import redirect
            frontend_url = f"http://localhost:5173/integrations?success=true&provider={provider}&message=Integration connected successfully"
            return redirect(frontend_url)
        
    except Exception as e:
        logger.error(f"OAuth callback failed for {provider}: {e}")
        
        # Return JSON response for API calls, redirect for browser requests
        if request.content_type == 'application/json' or 'application/json' in request.META.get('HTTP_ACCEPT', ''):
            # API request - return JSON error response
            return Response({
                'error': 'Failed to complete OAuth flow',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Browser request - redirect to frontend with error
            from django.shortcuts import redirect
            frontend_url = f"http://localhost:5173/integrations?error=true&provider={provider}&message=Failed to complete OAuth flow"
            return redirect(frontend_url)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def disconnect_integration(request, integration_id):
    """Disconnect an integration"""
    integration = get_object_or_404(Integration, id=integration_id, user=request.user)
    
    # Update status to disconnected
    integration.status = 'disconnected'
    integration.sync_enabled = False
    integration.save()
    
    return Response({'message': 'Integration disconnected successfully'})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_integration(request, integration_id):
    """Permanently delete an integration and all related data"""
    integration = get_object_or_404(Integration, id=integration_id, user=request.user)
    
    try:
        # Get counts for response
        calendar_events_count = integration.calendar_events.count()
        email_messages_count = integration.email_messages.count()
        sync_logs_count = integration.sync_logs.count()
        
        provider_name = integration.get_provider_display()
        
        # Delete the integration (CASCADE will handle related data)
        integration.delete()
        
        logger.info(f"Integration deleted for {request.user.email} - {provider_name}: "
                   f"{calendar_events_count} events, {email_messages_count} emails, "
                   f"{sync_logs_count} sync logs")
        
        return Response({
            'message': 'Integration and all related data deleted successfully',
            'deleted_data': {
                'provider': provider_name,
                'calendar_events': calendar_events_count,
                'email_messages': email_messages_count,
                'sync_logs': sync_logs_count
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to delete integration {integration_id} for {request.user.email}: {e}")
        return Response(
            {'error': 'Failed to delete integration'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def manual_sync(request, integration_id):
    """Manually trigger sync for an integration"""
    integration = get_object_or_404(Integration, id=integration_id, user=request.user)
    
    if integration.status != 'connected':
        return Response({'error': 'Integration is not connected'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ManualSyncSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    sync_type = serializer.validated_data['sync_type']
    
    try:
        oauth_service = get_oauth_service(integration)
        
        if sync_type in ['calendar', 'full'] and integration.provider.endswith('_calendar'):
            oauth_service.sync_calendar_events()
        
        if sync_type in ['email', 'full'] and integration.provider.endswith('_gmail'):
            oauth_service.sync_gmail_messages()
        
        if sync_type in ['email', 'full'] and integration.provider.endswith('_outlook'):
            oauth_service.sync_outlook_messages()
        
        return Response({'message': 'Sync completed successfully'})
        
    except Exception as e:
        logger.error(f"Manual sync failed for {integration}: {e}")
        return Response({'error': 'Sync failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CalendarEventListView(generics.ListAPIView):
    """List calendar events for the user"""
    serializer_class = CalendarEventListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = CalendarEvent.objects.filter(integration__user=self.request.user)
        
        # Filter by provider
        provider = self.request.query_params.get('provider')
        if provider:
            queryset = queryset.filter(integration__provider=provider)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                queryset = queryset.filter(start_time__gte=start_dt)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                queryset = queryset.filter(end_time__lte=end_dt)
            except ValueError:
                pass
        
        # Search in title and description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('start_time')


class CalendarEventDetailView(generics.RetrieveAPIView):
    """Get calendar event details"""
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CalendarEvent.objects.filter(integration__user=self.request.user)


class EmailMessageListView(generics.ListAPIView):
    """List email messages for the user"""
    serializer_class = EmailMessageListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = EmailMessage.objects.filter(integration__user=self.request.user)
        
        # Filter by provider
        provider = self.request.query_params.get('provider')
        if provider:
            queryset = queryset.filter(integration__provider=provider)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by importance
        is_important = self.request.query_params.get('is_important')
        if is_important is not None:
            queryset = queryset.filter(is_important=is_important.lower() == 'true')
        
        # Search in subject and sender
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search) | Q(sender__icontains=search)
            )
        
        return queryset.order_by('-received_at')


class EmailMessageDetailView(generics.RetrieveAPIView):
    """Get email message details"""
    serializer_class = EmailMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EmailMessage.objects.filter(integration__user=self.request.user)


class SyncLogListView(generics.ListAPIView):
    """List sync logs for the user"""
    serializer_class = SyncLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = SyncLog.objects.filter(integration__user=self.request.user)
        
        # Filter by integration
        integration_id = self.request.query_params.get('integration')
        if integration_id:
            queryset = queryset.filter(integration_id=integration_id)
        
        # Filter by sync type
        sync_type = self.request.query_params.get('sync_type')
        if sync_type:
            queryset = queryset.filter(sync_type=sync_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-started_at')


# GitHub Repository Management Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def github_repositories(request):
    """Get GitHub repositories for the authenticated user"""
    try:
        # Get GitHub integration for the user
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        # Get query parameters
        user = request.GET.get('user')
        org = request.GET.get('org')
        repo_type = request.GET.get('type', 'all')
        sort = request.GET.get('sort', 'updated')
        per_page = min(int(request.GET.get('per_page', 30)), 100)
        page = int(request.GET.get('page', 1))
        
        repositories = github_service.get_repositories(
            user=user, org=org, type=repo_type, sort=sort, per_page=per_page, page=page
        )
        
        return Response({
            'repositories': repositories,
            'count': len(repositories)
        })
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub repositories error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch repositories'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def github_repository_detail(request, owner, repo):
    """Get details of a specific GitHub repository"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        repository = github_service.get_repository(owner, repo)
        
        return Response(repository)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub repository detail error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch repository details'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def github_create_repository(request):
    """Create a new GitHub repository"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        # Get data from request
        name = request.data.get('name')
        description = request.data.get('description')
        private = request.data.get('private', True)
        auto_init = request.data.get('auto_init', False)
        gitignore_template = request.data.get('gitignore_template')
        license_template = request.data.get('license_template')
        
        if not name:
            return Response(
                {'error': 'Repository name is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        repository = github_service.create_repository(
            name=name,
            description=description,
            private=private,
            auto_init=auto_init,
            gitignore_template=gitignore_template,
            license_template=license_template
        )
        
        return Response(repository, status=status.HTTP_201_CREATED)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub create repository error: {str(e)}")
        return Response(
            {'error': 'Failed to create repository'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def github_update_repository(request, owner, repo):
    """Update GitHub repository settings"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        # Update repository with provided data
        repository = github_service.update_repository(owner, repo, **request.data)
        
        return Response(repository)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub update repository error: {str(e)}")
        return Response(
            {'error': 'Failed to update repository'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def github_delete_repository(request, owner, repo):
    """Delete a GitHub repository"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        github_service.delete_repository(owner, repo)
        
        return Response({'message': 'Repository deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub delete repository error: {str(e)}")
        return Response(
            {'error': 'Failed to delete repository'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def github_repository_collaborators(request, owner, repo):
    """Get repository collaborators"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        collaborators = github_service.get_repository_collaborators(owner, repo)
        
        return Response(collaborators)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub repository collaborators error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch collaborators'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def github_add_collaborator(request, owner, repo, username):
    """Add a collaborator to repository"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        permission = request.data.get('permission', 'push')
        
        result = github_service.add_repository_collaborator(owner, repo, username, permission)
        
        return Response(result)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub add collaborator error: {str(e)}")
        return Response(
            {'error': 'Failed to add collaborator'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def github_repository_branches(request, owner, repo):
    """Get repository branches"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        branches = github_service.get_repository_branches(owner, repo)
        
        return Response(branches)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub repository branches error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch branches'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def github_repository_commits(request, owner, repo):
    """Get repository commits"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        # Get query parameters
        sha = request.GET.get('sha')
        path = request.GET.get('path')
        author = request.GET.get('author')
        since = request.GET.get('since')
        until = request.GET.get('until')
        per_page = min(int(request.GET.get('per_page', 30)), 100)
        page = int(request.GET.get('page', 1))
        
        commits = github_service.get_repository_commits(
            owner, repo, sha=sha, path=path, author=author, 
            since=since, until=until, per_page=per_page, page=page
        )
        
        return Response(commits)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub repository commits error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch commits'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def github_repository_contents(request, owner, repo):
    """Get repository contents"""
    try:
        integration = Integration.objects.get(user=request.user, provider='github', status='connected')
        github_service = GitHubOAuthService(integration)
        
        path = request.GET.get('path', '')
        ref = request.GET.get('ref')
        
        contents = github_service.get_repository_contents(owner, repo, path=path, ref=ref)
        
        return Response(contents)
        
    except Integration.DoesNotExist:
        return Response(
            {'error': 'GitHub integration not found or not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"GitHub repository contents error: {str(e)}")
        return Response(
            {'error': 'Failed to fetch repository contents'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )