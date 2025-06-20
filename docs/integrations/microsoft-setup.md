# Microsoft 365 Integration Setup

This guide covers setting up Microsoft 365 integrations for Outlook (Email), Calendar, and Teams in your application.

## Prerequisites

- Microsoft 365 developer account or Azure subscription
- Admin access to Azure Active Directory
- Basic understanding of OAuth 2.0 and Microsoft Graph API

## 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **+ New registration**
4. Configure:
   - **Name**: `Integrato App`
   - **Supported account types**: 
     - Choose "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: 
     - Platform: **Web**
     - URI: `http://localhost:3000/auth/microsoft/callback`
5. Click **Register**

## 2. Configure App Permissions

### API Permissions
1. Go to **API permissions** in your app registration
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following permissions:

#### Email (Outlook)
```
Mail.Read
Mail.ReadWrite
Mail.Send
MailboxSettings.Read
MailboxSettings.ReadWrite
```

#### Calendar
```
Calendars.Read
Calendars.ReadWrite
Calendars.Read.Shared
Calendars.ReadWrite.Shared
```

#### User Profile
```
User.Read
User.ReadBasic.All
Profile
OpenId
Email
```

#### Teams (Optional)
```
Team.ReadBasic.All
Channel.ReadBasic.All
ChatMessage.Read
ChatMessage.Send
```

6. Click **Grant admin consent** (if you have admin rights)

## 3. Configure Authentication

### Redirect URIs
1. Go to **Authentication**
2. Add redirect URIs:
   ```
   http://localhost:3000/auth/microsoft/callback
   https://yourdomain.com/auth/microsoft/callback
   ```

### Advanced Settings
3. Configure:
   - **Access tokens**: ✓ Enabled
   - **ID tokens**: ✓ Enabled
   - **Allow public client flows**: No

## 4. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **+ New client secret**
3. Configure:
   - **Description**: `Integrato App Secret`
   - **Expires**: 24 months (recommended)
4. Click **Add**
5. **Copy the secret value immediately** - it won't be shown again

## 5. Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_application_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
MICROSOFT_TENANT_ID=common  # or your specific tenant ID
MICROSOFT_REDIRECT_URI=http://localhost:8000/auth/microsoft/callback/

# Microsoft Graph API
MICROSOFT_GRAPH_ENDPOINT=https://graph.microsoft.com/v1.0
```

### Frontend (.env)
```env
# Microsoft OAuth
VITE_MICROSOFT_CLIENT_ID=your_application_id_here
VITE_MICROSOFT_AUTHORITY=https://login.microsoftonline.com/common
```

## 6. Microsoft Graph API Endpoints

### Email Operations
```
# Get messages
GET /me/messages

# Send email
POST /me/sendMail

# Get specific message
GET /me/messages/{message-id}

# Mark as read/unread
PATCH /me/messages/{message-id}
```

### Calendar Operations
```
# Get calendars
GET /me/calendars

# Get events
GET /me/events

# Create event
POST /me/events

# Update event
PATCH /me/events/{event-id}

# Delete event
DELETE /me/events/{event-id}
```

### User Profile
```
# Get user profile
GET /me

# Get user photo
GET /me/photo/$value
```

## 7. Rate Limits and Throttling

### Microsoft Graph Limits
- **Outlook**: 10,000 requests per 10 minutes per app per mailbox
- **Calendar**: 10,000 requests per 10 minutes per app per mailbox
- **General**: 10,000 requests per 10 minutes per app

### Best Practices
1. Implement exponential backoff
2. Use batch requests for multiple operations
3. Cache responses when appropriate
4. Monitor throttling headers:
   - `Retry-After`
   - `RateLimit-Limit`
   - `RateLimit-Remaining`

## 8. Webhook Configuration (Optional)

### Set up Change Notifications
1. **Subscription endpoint**: `/webhooks/microsoft`
2. **Supported resources**:
   - `me/messages` (Email changes)
   - `me/events` (Calendar changes)
   - `me/mailFolders('Inbox')/messages` (Inbox only)

### Webhook Setup
```http
POST https://graph.microsoft.com/v1.0/subscriptions
Content-Type: application/json

{
  "changeType": "created,updated,deleted",
  "notificationUrl": "https://yourdomain.com/webhooks/microsoft",
  "resource": "me/messages",
  "expirationDateTime": "2024-01-01T00:00:00.0000000Z",
  "clientState": "your-secret-state"
}
```

## 9. Security Configuration

### App Security
1. **Enable certificate authentication** (production)
2. **Configure conditional access policies**
3. **Set up app protection policies**
4. **Enable audit logging**

### Token Management
1. **Access token lifetime**: 1 hour (default)
2. **Refresh token lifetime**: 90 days (default)
3. **Implement proper token storage**
4. **Use secure token refresh flow**

## 10. Testing and Development

### Graph Explorer
1. Use [Microsoft Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
2. Test API calls with your permissions
3. Validate response formats

### Postman Collection
1. Import Microsoft Graph Postman collection
2. Configure OAuth 2.0 authentication
3. Test various endpoints

## 11. Production Considerations

### Multi-tenant Support
1. Configure for multi-tenant if needed
2. Handle different tenant configurations
3. Implement proper tenant isolation

### Compliance
1. **GDPR compliance** for EU users
2. **Data residency** requirements
3. **Audit trail** implementation
4. **Data retention** policies

## 12. Common Issues and Solutions

### "AADSTS50011: The reply URL specified in the request does not match"
- Verify redirect URI in app registration
- Check for trailing slashes
- Ensure exact match including protocol

### "Insufficient privileges to complete the operation"
- Check API permissions
- Ensure admin consent is granted
- Verify user has necessary licenses

### "TokenNotFound" or "InvalidAuthenticationToken"
- Check token expiration
- Implement proper token refresh
- Verify token format and encoding

## 13. Monitoring and Analytics

### Azure AD Logs
1. Monitor sign-in logs
2. Review audit logs
3. Set up alerts for failures

### Application Insights
1. Track API usage
2. Monitor performance
3. Set up custom telemetry

## 14. Sample Code Structure

### Backend Service Class
```python
class MicrosoftGraphService:
    def __init__(self, access_token):
        self.access_token = access_token
        self.base_url = "https://graph.microsoft.com/v1.0"
    
    def get_messages(self, folder="inbox", limit=50):
        # Implementation
        pass
    
    def send_email(self, to, subject, body):
        # Implementation
        pass
    
    def get_calendar_events(self, start_date, end_date):
        # Implementation
        pass
```

## 15. Next Steps

1. Implement OAuth 2.0 flow with MSAL library
2. Create service classes for Graph API operations
3. Set up webhook endpoints for real-time updates
4. Implement proper error handling and retry logic
5. Add comprehensive logging and monitoring
6. Test with different user scenarios

## Useful Links

- [Microsoft Graph Documentation](https://docs.microsoft.com/graph/)
- [Azure App Registration Guide](https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
- [MSAL Libraries](https://docs.microsoft.com/azure/active-directory/develop/msal-overview)
- [Graph API Permissions Reference](https://docs.microsoft.com/graph/permissions-reference)