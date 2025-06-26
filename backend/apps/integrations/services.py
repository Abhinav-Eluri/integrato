import requests
import json
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Integration, CalendarEvent, EmailMessage, SyncLog
import logging

logger = logging.getLogger(__name__)


class OAuthService:
    """Base OAuth service class"""
    
    def __init__(self, integration):
        self.integration = integration
    
    def refresh_access_token(self):
        """Refresh the access token using refresh token"""
        raise NotImplementedError
    
    def get_valid_token(self):
        """Get a valid access token, refreshing if necessary"""
        if self.integration.is_token_expired:
            self.refresh_access_token()
        return self.integration.get_access_token()
    
    def make_authenticated_request(self, url, method='GET', **kwargs):
        """Make an authenticated API request"""
        token = self.get_valid_token()
        if not token:
            raise ValidationError("No valid access token available")
        
        headers = kwargs.get('headers', {})
        headers['Authorization'] = f'Bearer {token}'
        kwargs['headers'] = headers
        
        response = requests.request(method, url, **kwargs)
        
        if response.status_code == 401:
            # Token might be expired, try refreshing
            self.refresh_access_token()
            token = self.integration.get_access_token()
            headers['Authorization'] = f'Bearer {token}'
            response = requests.request(method, url, **kwargs)
        
        return response


class GoogleOAuthService(OAuthService):
    """Google OAuth and API service"""
    
    GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
    GOOGLE_GMAIL_API = 'https://gmail.googleapis.com/gmail/v1'
    
    @classmethod
    def get_oauth_url(cls, provider, state=None):
        """Generate Google OAuth URL"""
        client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
        redirect_uri = f"{settings.FRONTEND_URL}/integrations/callback"
        
        scopes = []
        if provider == 'google_calendar':
            scopes = ['https://www.googleapis.com/auth/calendar.readonly']
        elif provider == 'google_gmail':
            scopes = ['https://www.googleapis.com/auth/gmail.readonly']
        
        scope_str = ' '.join(scopes)
        
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'scope': scope_str,
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent',
        }
        
        if state:
            params['state'] = state
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
    
    @classmethod
    def exchange_code_for_tokens(cls, code, provider):
        """Exchange authorization code for access and refresh tokens"""
        client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
        client_secret = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret']
        redirect_uri = f"{settings.FRONTEND_URL}/integrations/callback"
        
        data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }
        
        response = requests.post(cls.GOOGLE_TOKEN_URL, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            return {
                'access_token': token_data.get('access_token'),
                'refresh_token': token_data.get('refresh_token'),
                'expires_in': token_data.get('expires_in', 3600),
                'scope': token_data.get('scope', ''),
            }
        else:
            logger.error(f"Token exchange failed: {response.text}")
            raise ValidationError("Failed to exchange code for tokens")
    
    def refresh_access_token(self):
        """Refresh Google access token"""
        refresh_token = self.integration.get_refresh_token()
        if not refresh_token:
            raise ValidationError("No refresh token available")
        
        client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
        client_secret = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret']
        
        data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        }
        
        response = requests.post(self.GOOGLE_TOKEN_URL, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.integration.set_access_token(token_data['access_token'])
            self.integration.token_expires_at = timezone.now() + timedelta(
                seconds=token_data.get('expires_in', 3600)
            )
            self.integration.status = 'connected'
            self.integration.save()
        else:
            logger.error(f"Token refresh failed: {response.text}")
            self.integration.status = 'expired'
            self.integration.save()
            raise ValidationError("Failed to refresh access token")
    
    def get_user_info(self):
        """Get Google user information"""
        url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        response = self.make_authenticated_request(url)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to get user info: {response.text}")
            return None
    
    def sync_calendar_events(self, calendar_id='primary'):
        """Sync Google Calendar events"""
        if self.integration.provider != 'google_calendar':
            return
        
        sync_log = SyncLog.objects.create(
            integration=self.integration,
            sync_type='calendar',
            status='started'
        )
        
        try:
            # Get events from the last 30 days to 30 days in the future
            time_min = (timezone.now() - timedelta(days=30)).isoformat()
            time_max = (timezone.now() + timedelta(days=30)).isoformat()
            
            url = f"{self.GOOGLE_CALENDAR_API}/calendars/{calendar_id}/events"
            params = {
                'timeMin': time_min,
                'timeMax': time_max,
                'singleEvents': True,
                'orderBy': 'startTime',
                'maxResults': 250
            }
            
            response = self.make_authenticated_request(url, params=params)
            
            if response.status_code == 200:
                events_data = response.json()
                events = events_data.get('items', [])
                
                created_count = 0
                updated_count = 0
                
                for event_data in events:
                    event_id = event_data.get('id')
                    if not event_id:
                        continue
                    
                    # Parse event data
                    start = event_data.get('start', {})
                    end = event_data.get('end', {})
                    
                    # Handle all-day events
                    if 'date' in start:
                        start_time = datetime.fromisoformat(start['date']).replace(tzinfo=timezone.utc)
                        end_time = datetime.fromisoformat(end['date']).replace(tzinfo=timezone.utc)
                        is_all_day = True
                    else:
                        start_time = datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
                        end_time = datetime.fromisoformat(end['dateTime'].replace('Z', '+00:00'))
                        is_all_day = False
                    
                    # Extract attendees
                    attendees = []
                    for attendee in event_data.get('attendees', []):
                        attendees.append({
                            'email': attendee.get('email'),
                            'displayName': attendee.get('displayName'),
                            'responseStatus': attendee.get('responseStatus')
                        })
                    
                    # Create or update event
                    event_obj, created = CalendarEvent.objects.update_or_create(
                        integration=self.integration,
                        provider_event_id=event_id,
                        defaults={
                            'title': event_data.get('summary', 'No Title'),
                            'description': event_data.get('description', ''),
                            'location': event_data.get('location', ''),
                            'start_time': start_time,
                            'end_time': end_time,
                            'is_all_day': is_all_day,
                            'timezone': start.get('timeZone', ''),
                            'attendees': attendees,
                            'created_by': event_data.get('creator', {}).get('email', ''),
                            'event_status': event_data.get('status', 'confirmed'),
                            'last_modified': datetime.fromisoformat(
                                event_data.get('updated', timezone.now().isoformat()).replace('Z', '+00:00')
                            )
                        }
                    )
                    
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                
                # Update sync log
                sync_log.status = 'completed'
                sync_log.items_processed = len(events)
                sync_log.items_created = created_count
                sync_log.items_updated = updated_count
                sync_log.completed_at = timezone.now()
                sync_log.save()
                
                # Update integration last sync
                self.integration.last_sync = timezone.now()
                self.integration.save()
                
                logger.info(f"Synced {len(events)} calendar events for {self.integration}")
                
            else:
                raise Exception(f"API request failed: {response.text}")
                
        except Exception as e:
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.completed_at = timezone.now()
            sync_log.save()
            logger.error(f"Calendar sync failed for {self.integration}: {e}")
            raise
    
    def sync_gmail_messages(self, max_results=50):
        """Sync Gmail messages"""
        if self.integration.provider != 'google_gmail':
            return
        
        sync_log = SyncLog.objects.create(
            integration=self.integration,
            sync_type='email',
            status='started'
        )
        
        try:
            # Get recent messages
            url = f"{self.GOOGLE_GMAIL_API}/users/me/messages"
            params = {
                'maxResults': max_results,
                'q': 'in:inbox'
            }
            
            response = self.make_authenticated_request(url, params=params)
            
            if response.status_code == 200:
                messages_data = response.json()
                messages = messages_data.get('messages', [])
                
                created_count = 0
                updated_count = 0
                
                for message_ref in messages:
                    message_id = message_ref.get('id')
                    if not message_id:
                        continue
                    
                    # Get full message details
                    message_url = f"{self.GOOGLE_GMAIL_API}/users/me/messages/{message_id}"
                    message_response = self.make_authenticated_request(message_url)
                    
                    if message_response.status_code == 200:
                        message_data = message_response.json()
                        
                        # Parse message headers
                        headers = {h['name']: h['value'] for h in message_data.get('payload', {}).get('headers', [])}
                        
                        # Extract body
                        body_text = ''
                        body_html = ''
                        payload = message_data.get('payload', {})
                        
                        if 'parts' in payload:
                            for part in payload['parts']:
                                if part.get('mimeType') == 'text/plain':
                                    body_text = part.get('body', {}).get('data', '')
                                elif part.get('mimeType') == 'text/html':
                                    body_html = part.get('body', {}).get('data', '')
                        else:
                            if payload.get('mimeType') == 'text/plain':
                                body_text = payload.get('body', {}).get('data', '')
                            elif payload.get('mimeType') == 'text/html':
                                body_html = payload.get('body', {}).get('data', '')
                        
                        # Parse labels
                        labels = message_data.get('labelIds', [])
                        
                        # Check if read
                        is_read = 'UNREAD' not in labels
                        is_important = 'IMPORTANT' in labels
                        
                        # Parse date
                        received_at = datetime.fromtimestamp(
                            int(message_data.get('internalDate', 0)) / 1000,
                            tz=timezone.utc
                        )
                        
                        # Create or update message
                        message_obj, created = EmailMessage.objects.update_or_create(
                            integration=self.integration,
                            provider_message_id=message_id,
                            defaults={
                                'thread_id': message_data.get('threadId', ''),
                                'subject': headers.get('Subject', 'No Subject'),
                                'sender': headers.get('From', ''),
                                'recipients': [headers.get('To', '')],
                                'body_text': body_text,
                                'body_html': body_html,
                                'received_at': received_at,
                                'is_read': is_read,
                                'is_important': is_important,
                                'labels': labels,
                                'has_attachments': len(payload.get('parts', [])) > 1,
                                'attachment_count': len([p for p in payload.get('parts', []) if p.get('filename')])
                            }
                        )
                        
                        if created:
                            created_count += 1
                        else:
                            updated_count += 1
                
                # Update sync log
                sync_log.status = 'completed'
                sync_log.items_processed = len(messages)
                sync_log.items_created = created_count
                sync_log.items_updated = updated_count
                sync_log.completed_at = timezone.now()
                sync_log.save()
                
                # Update integration last sync
                self.integration.last_sync = timezone.now()
                self.integration.save()
                
                logger.info(f"Synced {len(messages)} email messages for {self.integration}")
                
            else:
                raise Exception(f"API request failed: {response.text}")
                
        except Exception as e:
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.completed_at = timezone.now()
            sync_log.save()
            logger.error(f"Email sync failed for {self.integration}: {e}")
            raise


class MicrosoftOAuthService(OAuthService):
    """Microsoft OAuth and API service"""
    
    MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0'
    MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    
    @classmethod
    def get_oauth_url(cls, provider, state=None):
        """Generate Microsoft OAuth URL"""
        from urllib.parse import urlencode
        
        client_id = settings.MICROSOFT_CLIENT_ID
        redirect_uri = f"{settings.FRONTEND_URL}/integrations/callback"
        
        scopes = []
        if provider == 'microsoft_calendar':
            scopes = [
                'https://graph.microsoft.com/Calendars.Read',
                'https://graph.microsoft.com/Calendars.ReadWrite',
                'https://graph.microsoft.com/User.Read'
            ]
        elif provider == 'microsoft_outlook':
            scopes = [
                'https://graph.microsoft.com/Mail.Read',
                'https://graph.microsoft.com/Mail.ReadWrite',
                'https://graph.microsoft.com/Mail.Send',
                'https://graph.microsoft.com/User.Read'
            ]
        
        scope_str = ' '.join(scopes)
        
        params = {
            'client_id': client_id,
            'response_type': 'code',
            'redirect_uri': redirect_uri,
            'scope': scope_str,
            'response_mode': 'query',
        }
        
        if state:
            params['state'] = state
        
        query_string = urlencode(params)
        return f"{cls.MICROSOFT_AUTH_URL}?{query_string}"
    
    @classmethod
    def exchange_code_for_tokens(cls, code, provider):
        """Exchange authorization code for access and refresh tokens"""
        import requests
        
        client_id = settings.MICROSOFT_CLIENT_ID
        client_secret = settings.MICROSOFT_CLIENT_SECRET
        redirect_uri = f"{settings.FRONTEND_URL}/integrations/callback"
        
        data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }
        
        response = requests.post(cls.MICROSOFT_TOKEN_URL, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        return {
            'access_token': token_data['access_token'],
            'refresh_token': token_data.get('refresh_token'),
            'expires_in': token_data.get('expires_in', 3600),
            'token_type': token_data.get('token_type', 'Bearer')
        }
    
    def refresh_access_token(self):
        """Refresh Microsoft access token"""
        import requests
        
        if not self.integration.refresh_token:
            raise ValueError("No refresh token available")
        
        refresh_token = self.integration.get_refresh_token()
        client_id = settings.MICROSOFT_CLIENT_ID
        client_secret = settings.MICROSOFT_CLIENT_SECRET
        
        data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        }
        
        response = requests.post(self.MICROSOFT_TOKEN_URL, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        
        # Update integration with new tokens
        self.integration.set_access_token(token_data['access_token'])
        if token_data.get('refresh_token'):
            self.integration.set_refresh_token(token_data['refresh_token'])
        
        self.integration.token_expires_at = timezone.now() + timedelta(seconds=token_data.get('expires_in', 3600))
        self.integration.save()
        
        return token_data['access_token']
    
    def get_user_info(self):
        """Get user information from Microsoft Graph"""
        import requests
        
        access_token = self.integration.get_access_token()
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f'{self.MICROSOFT_GRAPH_API}/me', headers=headers)
        response.raise_for_status()
        
        user_data = response.json()
        return {
            'id': user_data.get('id'),
            'email': user_data.get('mail') or user_data.get('userPrincipalName'),
            'name': user_data.get('displayName')
        }
    
    def sync_calendar_events(self):
        """Sync Microsoft Calendar events"""
        import requests
        from datetime import datetime, timedelta
        
        access_token = self.integration.get_access_token()
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Get events from the last 30 days and next 30 days
        start_time = (datetime.now() - timedelta(days=30)).isoformat() + 'Z'
        end_time = (datetime.now() + timedelta(days=30)).isoformat() + 'Z'
        
        params = {
            '$filter': f"start/dateTime ge '{start_time}' and end/dateTime le '{end_time}'",
            '$orderby': 'start/dateTime',
            '$top': 100
        }
        
        response = requests.get(
            f'{self.MICROSOFT_GRAPH_API}/me/events',
            headers=headers,
            params=params
        )
        response.raise_for_status()
        
        events_data = response.json()
        events = []
        
        for event in events_data.get('value', []):
            events.append({
                'id': event['id'],
                'title': event.get('subject', 'No Title'),
                'description': event.get('bodyPreview', ''),
                'start_time': event['start']['dateTime'],
                'end_time': event['end']['dateTime'],
                'location': event.get('location', {}).get('displayName', ''),
                'attendees': [attendee.get('emailAddress', {}).get('address') for attendee in event.get('attendees', [])],
                'organizer': event.get('organizer', {}).get('emailAddress', {}).get('address'),
                'created_at': event.get('createdDateTime'),
                'updated_at': event.get('lastModifiedDateTime')
            })
        
        # Update last sync time
        self.integration.last_sync = timezone.now()
        self.integration.save()
        
        return events
    
    def sync_outlook_messages(self):
        """Sync Outlook messages"""
        import requests
        
        access_token = self.integration.get_access_token()
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        params = {
            '$orderby': 'receivedDateTime desc',
            '$top': 50,
            '$select': 'id,subject,bodyPreview,from,toRecipients,receivedDateTime,isRead,importance'
        }
        
        response = requests.get(
            f'{self.MICROSOFT_GRAPH_API}/me/messages',
            headers=headers,
            params=params
        )
        response.raise_for_status()
        
        messages_data = response.json()
        messages = []
        
        for message in messages_data.get('value', []):
            messages.append({
                'id': message['id'],
                'subject': message.get('subject', 'No Subject'),
                'body_preview': message.get('bodyPreview', ''),
                'from_email': message.get('from', {}).get('emailAddress', {}).get('address'),
                'from_name': message.get('from', {}).get('emailAddress', {}).get('name'),
                'to_recipients': [recipient.get('emailAddress', {}).get('address') for recipient in message.get('toRecipients', [])],
                'received_at': message.get('receivedDateTime'),
                'is_read': message.get('isRead', False),
                'importance': message.get('importance', 'normal')
            })
        
        # Update last sync time
        self.integration.last_sync = timezone.now()
        self.integration.save()
        
        return messages


class GitHubOAuthService(OAuthService):
    """GitHub OAuth and API service"""
    
    GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
    GITHUB_API_URL = 'https://api.github.com'
    GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize'
    
    @classmethod
    def get_oauth_url(cls, provider, state=None):
        """Generate GitHub OAuth URL"""
        from urllib.parse import urlencode
        
        client_id = getattr(settings, 'GITHUB_CLIENT_ID', '')
        redirect_uri = f"{settings.FRONTEND_URL}/integrations/callback"
        
        scopes = ['repo', 'user:email', 'notifications']
        scope_str = ' '.join(scopes)
        
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'scope': scope_str,
            'response_type': 'code',
        }
        
        if state:
            params['state'] = state
        
        return f"{cls.GITHUB_AUTH_URL}?{urlencode(params)}"
    
    def exchange_code_for_tokens(self, code, redirect_uri):
        """Exchange authorization code for access token"""
        data = {
            'client_id': getattr(settings, 'GITHUB_CLIENT_ID', ''),
            'client_secret': getattr(settings, 'GITHUB_CLIENT_SECRET', ''),
            'code': code,
            'redirect_uri': redirect_uri,
        }
        
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        
        response = requests.post(self.GITHUB_TOKEN_URL, data=data, headers=headers)
        response.raise_for_status()
        
        token_data = response.json()
        
        if 'error' in token_data:
            raise ValidationError(f"GitHub OAuth error: {token_data.get('error_description', 'Unknown error')}")
        
        return {
            'access_token': token_data['access_token'],
            'token_type': token_data.get('token_type', 'bearer'),
            'scope': token_data.get('scope', ''),
        }
    
    def get_user_info(self):
        """Get GitHub user information"""
        headers = {
            'Authorization': f'token {self.get_valid_token()}',
            'Accept': 'application/vnd.github.v3+json',
        }
        
        response = requests.get(f'{self.GITHUB_API_URL}/user', headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def _make_authenticated_request(self, method, endpoint, data=None, params=None):
        """Make authenticated request to GitHub API"""
        headers = {
            'Authorization': f'token {self.get_valid_token()}',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        }
        
        url = f'{self.GITHUB_API_URL}{endpoint}'
        
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, params=params)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method.upper() == 'PATCH':
            response = requests.patch(url, headers=headers, json=data)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        response.raise_for_status()
        
        # Handle empty responses (like DELETE operations)
        if response.status_code == 204 or not response.content:
            return {}
        
        return response.json()
    
    # Repository Management Methods
    def get_repositories(self, user=None, org=None, type='all', sort='updated', per_page=30, page=1):
        """Get repositories for user, organization, or authenticated user"""
        params = {
            'type': type,
            'sort': sort,
            'per_page': per_page,
            'page': page
        }
        
        if org:
            endpoint = f'/orgs/{org}/repos'
        elif user:
            endpoint = f'/users/{user}/repos'
        else:
            endpoint = '/user/repos'
        
        return self._make_authenticated_request('GET', endpoint, params=params)
    
    def get_repository(self, owner, repo):
        """Get a specific repository"""
        endpoint = f'/repos/{owner}/{repo}'
        return self._make_authenticated_request('GET', endpoint)
    
    def create_repository(self, name, description=None, private=True, auto_init=False, gitignore_template=None, license_template=None):
        """Create a new repository"""
        data = {
            'name': name,
            'private': private,
            'auto_init': auto_init
        }
        
        if description:
            data['description'] = description
        if gitignore_template:
            data['gitignore_template'] = gitignore_template
        if license_template:
            data['license_template'] = license_template
        
        return self._make_authenticated_request('POST', '/user/repos', data)
    
    def update_repository(self, owner, repo, **kwargs):
        """Update repository settings"""
        endpoint = f'/repos/{owner}/{repo}'
        return self._make_authenticated_request('PATCH', endpoint, kwargs)
    
    def delete_repository(self, owner, repo):
        """Delete a repository"""
        endpoint = f'/repos/{owner}/{repo}'
        return self._make_authenticated_request('DELETE', endpoint)
    
    def get_repository_collaborators(self, owner, repo):
        """Get repository collaborators"""
        endpoint = f'/repos/{owner}/{repo}/collaborators'
        return self._make_authenticated_request('GET', endpoint)
    
    def add_repository_collaborator(self, owner, repo, username, permission='push'):
        """Add a collaborator to repository"""
        endpoint = f'/repos/{owner}/{repo}/collaborators/{username}'
        data = {'permission': permission}
        return self._make_authenticated_request('PUT', endpoint, data)
    
    def remove_repository_collaborator(self, owner, repo, username):
        """Remove a collaborator from repository"""
        endpoint = f'/repos/{owner}/{repo}/collaborators/{username}'
        return self._make_authenticated_request('DELETE', endpoint)
    
    def get_repository_branches(self, owner, repo):
        """Get repository branches"""
        endpoint = f'/repos/{owner}/{repo}/branches'
        return self._make_authenticated_request('GET', endpoint)
    
    def get_repository_commits(self, owner, repo, sha=None, path=None, author=None, since=None, until=None, per_page=30, page=1):
        """Get repository commits"""
        endpoint = f'/repos/{owner}/{repo}/commits'
        params = {
            'per_page': per_page,
            'page': page
        }
        
        if sha:
            params['sha'] = sha
        if path:
            params['path'] = path
        if author:
            params['author'] = author
        if since:
            params['since'] = since
        if until:
            params['until'] = until
        
        return self._make_authenticated_request('GET', endpoint, params=params)
    
    def get_repository_contents(self, owner, repo, path='', ref=None):
        """Get repository contents"""
        endpoint = f'/repos/{owner}/{repo}/contents/{path}'
        params = {}
        if ref:
            params['ref'] = ref
        
        return self._make_authenticated_request('GET', endpoint, params=params)
    
    def create_file(self, owner, repo, path, message, content, branch=None, committer=None, author=None):
        """Create a file in repository"""
        import base64
        
        endpoint = f'/repos/{owner}/{repo}/contents/{path}'
        data = {
            'message': message,
            'content': base64.b64encode(content.encode()).decode()
        }
        
        if branch:
            data['branch'] = branch
        if committer:
            data['committer'] = committer
        if author:
            data['author'] = author
        
        return self._make_authenticated_request('PUT', endpoint, data)
    
    def update_file(self, owner, repo, path, message, content, sha, branch=None, committer=None, author=None):
        """Update a file in repository"""
        import base64
        
        endpoint = f'/repos/{owner}/{repo}/contents/{path}'
        data = {
            'message': message,
            'content': base64.b64encode(content.encode()).decode(),
            'sha': sha
        }
        
        if branch:
            data['branch'] = branch
        if committer:
            data['committer'] = committer
        if author:
            data['author'] = author
        
        return self._make_authenticated_request('PUT', endpoint, data)
    
    def delete_file(self, owner, repo, path, message, sha, branch=None, committer=None, author=None):
        """Delete a file from repository"""
        endpoint = f'/repos/{owner}/{repo}/contents/{path}'
        data = {
            'message': message,
            'sha': sha
        }
        
        if branch:
            data['branch'] = branch
        if committer:
            data['committer'] = committer
        if author:
            data['author'] = author
        
        return self._make_authenticated_request('DELETE', endpoint, data)


class SlackOAuthService(OAuthService):
    """Slack OAuth and API service"""
    
    SLACK_TOKEN_URL = 'https://slack.com/api/oauth.v2.access'
    SLACK_API_URL = 'https://slack.com/api'
    SLACK_AUTH_URL = 'https://slack.com/oauth/v2/authorize'
    
    @classmethod
    def get_oauth_url(cls, provider, state=None):
        """Generate Slack OAuth URL"""
        from urllib.parse import urlencode
        
        client_id = getattr(settings, 'SLACK_CLIENT_ID', '')
        redirect_uri = f"{settings.FRONTEND_URL}/integrations/callback"
        
        scopes = [
            'channels:read',
            'channels:write',
            'chat:write',
            'users:read',
            'users:read.email',
            'team:read'
        ]
        scope_str = ','.join(scopes)
        
        params = {
            'client_id': client_id,
            'scope': scope_str,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
        }
        
        if state:
            params['state'] = state
        
        return f"{cls.SLACK_AUTH_URL}?{urlencode(params)}"
    
    def exchange_code_for_tokens(self, code, redirect_uri):
        """Exchange authorization code for access token"""
        data = {
            'client_id': getattr(settings, 'SLACK_CLIENT_ID', ''),
            'client_secret': getattr(settings, 'SLACK_CLIENT_SECRET', ''),
            'code': code,
            'redirect_uri': redirect_uri,
        }
        
        response = requests.post(self.SLACK_TOKEN_URL, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        
        if not token_data.get('ok'):
            raise ValidationError(f"Slack OAuth error: {token_data.get('error', 'Unknown error')}")
        
        return {
            'access_token': token_data['access_token'],
            'token_type': 'Bearer',
            'scope': token_data.get('scope', ''),
            'team_id': token_data.get('team', {}).get('id'),
            'team_name': token_data.get('team', {}).get('name'),
        }
    
    def get_user_info(self):
        """Get Slack user information"""
        headers = {
            'Authorization': f'Bearer {self.get_valid_token()}',
            'Content-Type': 'application/json',
        }
        
        response = requests.get(f'{self.SLACK_API_URL}/auth.test', headers=headers)
        response.raise_for_status()
        
        return response.json()


class CalendlyOAuthService(OAuthService):
    """Calendly OAuth and API service"""
    
    CALENDLY_TOKEN_URL = 'https://auth.calendly.com/oauth/token'
    CALENDLY_API_URL = 'https://api.calendly.com'
    CALENDLY_AUTH_URL = 'https://auth.calendly.com/oauth/authorize'
    
    @classmethod
    def get_oauth_url(cls, provider, state=None):
        """Generate Calendly OAuth URL"""
        from urllib.parse import urlencode
        
        client_id = getattr(settings, 'CALENDLY_CLIENT_ID', '')
        redirect_uri = getattr(settings, 'CALENDLY_REDIRECT_URI', '')
        
        params = {
            'client_id': client_id,
            'response_type': 'code',
            'redirect_uri': redirect_uri,
        }
        
        if state:
            params['state'] = state
        
        return f"{cls.CALENDLY_AUTH_URL}?{urlencode(params)}"
    
    @classmethod
    def exchange_code_for_tokens(cls, code, provider):
        """Exchange authorization code for access token"""
        import base64
        
        client_id = getattr(settings, 'CALENDLY_CLIENT_ID', '')
        client_secret = getattr(settings, 'CALENDLY_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'CALENDLY_REDIRECT_URI', '')
        
        # Calendly requires Basic HTTP Authentication for web clients
        credentials = f"{client_id}:{client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
        }
        
        response = requests.post(cls.CALENDLY_TOKEN_URL, data=data, headers=headers)
        response.raise_for_status()
        
        token_data = response.json()
        return {
            'access_token': token_data['access_token'],
            'refresh_token': token_data.get('refresh_token'),
            'expires_in': token_data.get('expires_in', 3600),
        }
    
    def get_user_info(self):
        """Get user information from Calendly"""
        access_token = self.integration.get_access_token()
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f'{self.CALENDLY_API_URL}/users/me', headers=headers)
        response.raise_for_status()
        
        user_data = response.json()
        return {
            'id': user_data['resource']['uri'].split('/')[-1],
            'email': user_data['resource']['email'],
            'name': user_data['resource']['name'],
        }
    
    def get_scheduled_events(self, start_time=None, end_time=None):
        """Get scheduled events from Calendly"""
        access_token = self.integration.get_access_token()
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Get user URI first
        user_response = requests.get(f'{self.CALENDLY_API_URL}/users/me', headers=headers)
        user_response.raise_for_status()
        user_uri = user_response.json()['resource']['uri']
        
        # Get scheduled events
        params = {
            'user': user_uri,
            'status': 'active'
        }
        
        if start_time:
            params['min_start_time'] = start_time.isoformat()
        if end_time:
            params['max_start_time'] = end_time.isoformat()
        
        response = requests.get(f'{self.CALENDLY_API_URL}/scheduled_events', headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def sync_scheduled_events(self):
        """Sync Calendly scheduled events"""
        from datetime import datetime, timedelta
        
        sync_log = SyncLog.objects.create(
            integration=self.integration,
            sync_type='calendar',
            status='started'
        )
        
        try:
            # Get events from the last 30 days and next 90 days
            start_time = timezone.now() - timedelta(days=30)
            end_time = timezone.now() + timedelta(days=90)
            
            events_data = self.get_scheduled_events(start_time, end_time)
            
            synced_count = 0
            for event_data in events_data.get('collection', []):
                event_uri = event_data['uri']
                event_id = event_uri.split('/')[-1]
                
                # Parse event details
                start_datetime = datetime.fromisoformat(event_data['start_time'].replace('Z', '+00:00'))
                end_datetime = datetime.fromisoformat(event_data['end_time'].replace('Z', '+00:00'))
                
                # Create or update calendar event
                calendar_event, created = CalendarEvent.objects.update_or_create(
                    integration=self.integration,
                    provider_event_id=event_id,
                    defaults={
                        'title': event_data.get('name', 'Calendly Event'),
                        'description': f"Calendly meeting: {event_data.get('name', '')}",
                        'start_time': start_datetime,
                        'end_time': end_datetime,
                        'event_status': 'confirmed' if event_data['status'] == 'active' else 'cancelled',
                        'synced_at': timezone.now(),
                        'provider_data': event_data
                    }
                )
                
                synced_count += 1
            
            sync_log.status = 'completed'
            sync_log.items_synced = synced_count
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            # Update integration last sync time
            self.integration.last_sync = timezone.now()
            self.integration.save()
            
            logger.info(f"Calendly sync completed: {synced_count} events synced")
            
        except Exception as e:
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            logger.error(f"Calendly sync failed: {str(e)}")
            raise


def get_oauth_service(integration):
    """Factory function to get the appropriate OAuth service"""
    if integration.provider.startswith('google_'):
        return GoogleOAuthService(integration)
    elif integration.provider.startswith('microsoft_'):
        return MicrosoftOAuthService(integration)
    elif integration.provider == 'github':
        return GitHubOAuthService(integration)
    elif integration.provider == 'slack':
        return SlackOAuthService(integration)
    elif integration.provider == 'calendly':
        return CalendlyOAuthService(integration)
    else:
        raise ValueError(f"Unsupported provider: {integration.provider}")