# Zoom Integration Setup

This guide covers setting up Zoom integrations for meetings, webinars, and user management in your application.

## Prerequisites

- Zoom account (Pro, Business, Education, or API plan)
- Zoom Marketplace developer account
- Basic understanding of OAuth 2.0 and JWT
- HTTPS endpoint for webhooks

## 1. Create Zoom App

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Click **Develop** → **Build App**
3. Choose app type:
   - **OAuth**: For user authorization (recommended)
   - **JWT**: For server-to-server (being deprecated)
   - **Server-to-Server OAuth**: For server applications
4. Enter app details:
   - **App Name**: `Integrato`
   - **Choose your app type**: OAuth
   - **Would you like to publish this app?**: No (for development)

## 2. Configure OAuth App

### Basic Information
1. Fill in required fields:
   - **App Name**: `Integrato`
   - **Short Description**: `Integration platform for productivity tools`
   - **Long Description**: Detailed description of your app
   - **Company Name**: Your company name
   - **Developer Name**: Your name
   - **Developer Email**: Your email

### App Credentials
2. Note down:
   - **Client ID**
   - **Client Secret**

### Redirect URL for OAuth
3. Add redirect URLs:
```
http://localhost:3000/auth/zoom/callback
https://yourdomain.com/auth/zoom/callback
```

### Whitelist URL
4. Add whitelist URLs (domains that can use your app):
```
http://localhost:3000
https://yourdomain.com
```

## 3. Configure Scopes

### Meeting Scopes
```
meeting:read:admin
meeting:write:admin
meeting:read
meeting:write
meeting:read:invitation_link
meeting:read:sip_dialing
meeting:read:live_stream
meeting:write:live_stream
```

### User Scopes
```
user:read:admin
user:write:admin
user:read
user:write
user:read:email
user_profile
```

### Webinar Scopes
```
webinar:read:admin
webinar:write:admin
webinar:read
webinar:write
webinar:read:invitation_link
webinar:read:sip_dialing
```

### Recording Scopes
```
recording:read:admin
recording:write:admin
recording:read
recording:write
```

### Report Scopes
```
report:read:admin
report_webinars:read:admin
report_meetings:read:admin
```

## 4. Set Up Webhooks (Event Subscriptions)

1. Go to **Feature** tab in your app
2. **Add Events**: Toggle on
3. **Event notification endpoint URL**: `https://yourdomain.com/webhooks/zoom`
4. **Add events**:

### Meeting Events
```
meeting.created
meeting.updated
meeting.deleted
meeting.started
meeting.ended
meeting.participant_joined
meeting.participant_left
meeting.sharing_started
meeting.sharing_ended
meeting.recording_completed
```

### Webinar Events
```
webinar.created
webinar.updated
webinar.deleted
webinar.started
webinar.ended
webinar.participant_joined
webinar.participant_left
webinar.registration_created
webinar.registration_approved
webinar.registration_denied
```

### User Events
```
user.created
user.updated
user.deleted
user.activated
user.deactivated
user.signed_in
user.signed_out
```

## 5. Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
# Zoom OAuth
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
ZOOM_REDIRECT_URI=http://localhost:8000/auth/zoom/callback/

# Zoom API
ZOOM_API_BASE_URL=https://api.zoom.us/v2
ZOOM_OAUTH_URL=https://zoom.us/oauth

# Webhook verification
ZOOM_WEBHOOK_SECRET_TOKEN=your_webhook_secret_here
```

### Frontend (.env)
```env
# Zoom OAuth
VITE_ZOOM_CLIENT_ID=your_client_id_here
VITE_ZOOM_OAUTH_URL=https://zoom.us/oauth/authorize
```

## 6. Zoom API Endpoints

### Authentication
```
# OAuth authorization
GET https://zoom.us/oauth/authorize

# Get access token
POST https://zoom.us/oauth/token

# Refresh token
POST https://zoom.us/oauth/token
```

### User Management
```
# Get current user
GET /users/me

# List users
GET /users

# Get user
GET /users/{userId}

# Create user
POST /users

# Update user
PATCH /users/{userId}
```

### Meeting Management
```
# List meetings
GET /users/{userId}/meetings

# Create meeting
POST /users/{userId}/meetings

# Get meeting
GET /meetings/{meetingId}

# Update meeting
PATCH /meetings/{meetingId}

# Delete meeting
DELETE /meetings/{meetingId}

# List meeting participants
GET /meetings/{meetingId}/participants
```

### Webinar Management
```
# List webinars
GET /users/{userId}/webinars

# Create webinar
POST /users/{userId}/webinars

# Get webinar
GET /webinars/{webinarId}

# Update webinar
PATCH /webinars/{webinarId}

# Delete webinar
DELETE /webinars/{webinarId}
```

### Recording Management
```
# List recordings
GET /users/{userId}/recordings

# Get meeting recordings
GET /meetings/{meetingId}/recordings

# Delete recording
DELETE /meetings/{meetingId}/recordings/{recordingId}
```

## 7. Rate Limits

### Zoom API Rate Limits
- **Light**: 10 requests per second
- **Medium**: 5 requests per second  
- **Heavy**: 1 request per second
- **Resource-intensive**: 1 request per second

### Rate Limit Headers
```
X-RateLimit-Type: QPS
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
```

### Best Practices
1. Implement exponential backoff
2. Monitor rate limit headers
3. Use bulk operations when available
4. Cache responses appropriately

## 8. Webhook Event Handling

### Event Structure
```json
{
  "event": "meeting.started",
  "payload": {
    "account_id": "account_id",
    "object": {
      "uuid": "meeting_uuid",
      "id": 123456789,
      "host_id": "host_user_id",
      "topic": "Meeting Topic",
      "type": 2,
      "start_time": "2024-01-01T10:00:00Z",
      "timezone": "America/New_York",
      "duration": 60
    }
  },
  "event_ts": 1234567890123
}
```

### Webhook Verification
1. **Validate webhook secret token**
2. **Verify request signature** (if configured)
3. **Check event timestamp** to prevent replay attacks

### Event Processing
```python
def handle_zoom_webhook(request):
    # Verify webhook
    if not verify_webhook_signature(request):
        return 401
    
    event_data = request.json()
    event_type = event_data.get('event')
    
    if event_type == 'meeting.started':
        handle_meeting_started(event_data['payload'])
    elif event_type == 'meeting.ended':
        handle_meeting_ended(event_data['payload'])
    
    return 200
```

## 9. Meeting Creation Examples

### Basic Meeting
```json
{
  "topic": "Team Standup",
  "type": 2,
  "start_time": "2024-01-01T10:00:00Z",
  "duration": 30,
  "timezone": "America/New_York",
  "agenda": "Daily team standup meeting",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "cn_meeting": false,
    "in_meeting": false,
    "join_before_host": false,
    "mute_upon_entry": true,
    "watermark": false,
    "use_pmi": false,
    "approval_type": 2,
    "audio": "both",
    "auto_recording": "cloud"
  }
}
```

### Recurring Meeting
```json
{
  "topic": "Weekly Team Meeting",
  "type": 8,
  "start_time": "2024-01-01T10:00:00Z",
  "duration": 60,
  "recurrence": {
    "type": 2,
    "repeat_interval": 1,
    "weekly_days": "2",
    "end_times": 10
  }
}
```

### Webinar Creation
```json
{
  "topic": "Product Launch Webinar",
  "type": 5,
  "start_time": "2024-01-01T14:00:00Z",
  "duration": 90,
  "agenda": "Introducing our new product features",
  "settings": {
    "host_video": true,
    "panelists_video": true,
    "practice_session": true,
    "hd_video": true,
    "approval_type": 1,
    "registration_type": 1,
    "audio": "both",
    "auto_recording": "cloud"
  }
}
```

## 10. Security Best Practices

### OAuth Security
1. **Use PKCE** for public clients
2. **Validate state parameter** to prevent CSRF
3. **Store tokens securely** (encrypted)
4. **Implement token refresh** logic

### Webhook Security
1. **Verify webhook signatures**
2. **Use HTTPS endpoints**
3. **Validate event timestamps**
4. **Implement idempotency**

### API Security
1. **Use least privilege scopes**
2. **Implement rate limiting**
3. **Log API usage**
4. **Monitor for suspicious activity**

## 11. Testing and Development

### Zoom SDK
1. **Web SDK**: For browser-based integrations
2. **Mobile SDK**: For iOS/Android apps
3. **Windows/macOS SDK**: For desktop applications

### Testing Tools
1. **Postman Collection**: Test API endpoints
2. **Webhook Testing**: Use ngrok for local development
3. **OAuth Playground**: Test authentication flow

### Development Environment
```bash
# Install Zoom SDK (if using)
npm install @zoomus/websdk

# For webhook testing
npm install -g ngrok
ngrok http 3000
```

## 12. Error Handling

### Common Error Codes
```
200: Success
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
409: Conflict
429: Too Many Requests
500: Internal Server Error
```

### Error Response Format
```json
{
  "code": 400,
  "message": "Bad Request",
  "errors": [
    {
      "field": "start_time",
      "message": "Invalid start time format"
    }
  ]
}
```

## 13. Monitoring and Analytics

### Zoom Analytics
1. **Usage Reports**: Track API usage
2. **Meeting Reports**: Analyze meeting data
3. **User Reports**: Monitor user activity

### Custom Metrics
1. **API call frequency**
2. **Meeting creation rates**
3. **User engagement**
4. **Error rates**

## 14. Production Considerations

### App Review Process
1. **Complete app information**
2. **Provide privacy policy**
3. **Submit for review**
4. **Address feedback**
5. **Publish to marketplace**

### Compliance
1. **GDPR compliance** for EU users
2. **HIPAA compliance** for healthcare
3. **SOC 2 compliance** for enterprise
4. **Data retention policies**

## 15. Common Issues and Solutions

### "Invalid client_id" Error
- Verify client ID in app credentials
- Check app type (OAuth vs JWT)
- Ensure app is activated

### "Meeting not found" Error
- Verify meeting ID format
- Check user permissions
- Ensure meeting exists and is accessible

### Webhook Not Receiving Events
- Verify webhook URL is accessible
- Check SSL certificate validity
- Ensure proper event subscriptions

## 16. Sample Code Structure

### Backend Service Class
```python
class ZoomService:
    def __init__(self, access_token):
        self.access_token = access_token
        self.base_url = "https://api.zoom.us/v2"
    
    def create_meeting(self, user_id, meeting_data):
        # Implementation
        pass
    
    def get_meetings(self, user_id):
        # Implementation
        pass
    
    def get_meeting_participants(self, meeting_id):
        # Implementation
        pass
    
    def create_webinar(self, user_id, webinar_data):
        # Implementation
        pass
```

### Frontend Integration
```javascript
// Zoom Web SDK integration
import { ZoomMtg } from '@zoomus/websdk';

ZoomMtg.setZoomJSLib('https://source.zoom.us/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

// Join meeting
ZoomMtg.init({
  leaveUrl: 'http://localhost:3000',
  success: (success) => {
    ZoomMtg.join({
      signature: signature,
      meetingNumber: meetingNumber,
      userName: userName,
      apiKey: apiKey,
      userEmail: userEmail,
      passWord: passWord,
      success: (success) => {
        console.log('Join meeting success');
      },
      error: (error) => {
        console.log('Join meeting error', error);
      }
    });
  },
  error: (error) => {
    console.log('Init error', error);
  }
});
```

## 17. Next Steps

1. Implement OAuth 2.0 flow for user authorization
2. Create meeting and webinar management endpoints
3. Set up webhook handlers for real-time events
4. Integrate Zoom Web SDK for in-browser meetings
5. Implement recording management features
6. Add comprehensive error handling and logging
7. Test with various meeting scenarios
8. Prepare for app marketplace submission

## Useful Links

- [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api)
- [Zoom Web SDK](https://marketplace.zoom.us/docs/sdk/native-sdks/web)
- [Zoom Webhook Reference](https://marketplace.zoom.us/docs/api-reference/webhook-reference)
- [OAuth Implementation Guide](https://marketplace.zoom.us/docs/guides/auth/oauth)
- [Zoom Marketplace](https://marketplace.zoom.us/)