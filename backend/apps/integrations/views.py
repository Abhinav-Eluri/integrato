from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import Integration, CalendarEvent, EmailMessage, SyncLog
from .serializers import (
    IntegrationSerializer, CalendarEventSerializer, CalendarEventListSerializer,
    EmailMessageSerializer, EmailMessageListSerializer, SyncLogSerializer,
    IntegrationStatsSerializer, OAuthCallbackSerializer, ManualSyncSerializer
)
from .services import GoogleOAuthService, MicrosoftOAuthService, get_oauth_service

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
            'available': False  # Not implemented yet
        },
        {
            'id': 'microsoft_outlook',
            'name': 'Microsoft Outlook',
            'description': 'Sync your Outlook email messages',
            'icon': 'outlook',
            'type': 'email',
            'available': False  # Not implemented yet
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
        else:
            return Response({'error': 'Provider not supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'oauth_url': oauth_url,
            'state': state
        })
        
    except Exception as e:
        logger.error(f"OAuth initiation failed for {provider}: {e}")
        return Response({'error': 'Failed to initiate OAuth'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def oauth_callback(request):
    """Handle OAuth callback and exchange code for tokens"""
    serializer = OAuthCallbackSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    code = serializer.validated_data['code']
    provider = serializer.validated_data['provider']
    state = serializer.validated_data.get('state')
    
    try:
        # Verify state parameter
        if state:
            state_parts = state.split(':')
            if len(state_parts) >= 2 and int(state_parts[0]) != request.user.id:
                return Response({'error': 'Invalid state parameter'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange code for tokens
        if provider.startswith('google_'):
            token_data = GoogleOAuthService.exchange_code_for_tokens(code, provider)
        elif provider.startswith('microsoft_'):
            token_data = MicrosoftOAuthService.exchange_code_for_tokens(code, provider)
        else:
            return Response({'error': 'Provider not supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update integration
        integration, created = Integration.objects.get_or_create(
            user=request.user,
            provider=provider,
            defaults={'status': 'connected'}
        )
        
        # Store tokens
        integration.set_access_token(token_data['access_token'])
        if token_data.get('refresh_token'):
            integration.set_refresh_token(token_data['refresh_token'])
        
        integration.token_expires_at = timezone.now() + timedelta(seconds=token_data['expires_in'])
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
        
        serializer = IntegrationSerializer(integration)
        return Response({
            'integration': serializer.data,
            'message': 'Integration connected successfully'
        })
        
    except Exception as e:
        logger.error(f"OAuth callback failed for {provider}: {e}")
        return Response({'error': 'Failed to complete OAuth flow'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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