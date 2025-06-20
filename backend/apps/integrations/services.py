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
    """Microsoft OAuth and API service (placeholder for future implementation)"""
    
    MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0'
    
    @classmethod
    def get_oauth_url(cls, provider, state=None):
        """Generate Microsoft OAuth URL"""
        # TODO: Implement Microsoft OAuth URL generation
        raise NotImplementedError("Microsoft OAuth not yet implemented")
    
    @classmethod
    def exchange_code_for_tokens(cls, code, provider):
        """Exchange authorization code for access and refresh tokens"""
        # TODO: Implement Microsoft token exchange
        raise NotImplementedError("Microsoft OAuth not yet implemented")
    
    def refresh_access_token(self):
        """Refresh Microsoft access token"""
        # TODO: Implement Microsoft token refresh
        raise NotImplementedError("Microsoft OAuth not yet implemented")
    
    def sync_calendar_events(self):
        """Sync Microsoft Calendar events"""
        # TODO: Implement Microsoft Calendar sync
        raise NotImplementedError("Microsoft Calendar sync not yet implemented")
    
    def sync_outlook_messages(self):
        """Sync Outlook messages"""
        # TODO: Implement Outlook sync
        raise NotImplementedError("Outlook sync not yet implemented")


def get_oauth_service(integration):
    """Factory function to get the appropriate OAuth service"""
    if integration.provider.startswith('google_'):
        return GoogleOAuthService(integration)
    elif integration.provider.startswith('microsoft_'):
        return MicrosoftOAuthService(integration)
    else:
        raise ValueError(f"Unsupported provider: {integration.provider}")