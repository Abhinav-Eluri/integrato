# Microsoft Integration Guide

This guide provides comprehensive instructions for setting up and using Microsoft Calendar and Outlook integrations in Integrato.

## Overview

Integrato supports two Microsoft integrations:
- **Microsoft Calendar**: Sync your calendar events, meetings, and appointments
- **Microsoft Outlook**: Access and manage your email messages

Both integrations use Microsoft Graph API and OAuth 2.0 for secure authentication.

## Prerequisites

- Microsoft 365 account or Azure subscription
- Admin access to Azure Active Directory (for app registration)
- Basic understanding of OAuth 2.0

## Setup Instructions

### 1. Azure App Registration

Follow the detailed setup guide in [microsoft-setup.md](./microsoft-setup.md) to:
1. Create an Azure App Registration
2. Configure API permissions
3. Set up authentication
4. Generate client secret
5. Configure environment variables

### 2. Backend Configuration

Add the following environment variables to your `.env` file:

```env
# Microsoft OAuth2
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### 3. Frontend Configuration

Add the Microsoft client ID to your frontend `.env` file:

```env
# Microsoft OAuth2
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id
```

## Features

### Microsoft Calendar Integration

#### Capabilities
- **Read calendar events**: Access your calendar events and meetings
- **Event details**: Get complete event information including:
  - Title and description
  - Start and end times
  - Location
  - Attendees list
  - Organizer information
  - Creation and modification timestamps

#### Permissions Required
- `Calendars.Read`: Read user calendars
- `Calendars.ReadWrite`: Read and write user calendars
- `Calendars.Read.Shared`: Read shared calendars
- `Calendars.ReadWrite.Shared`: Read and write shared calendars
- `User.Read`: Read user profile

#### Sync Behavior
- Syncs events from 30 days in the past to 30 days in the future
- Retrieves up to 100 events per sync
- Automatic token refresh when needed

### Microsoft Outlook Integration

#### Capabilities
- **Read email messages**: Access your inbox and email messages
- **Message details**: Get comprehensive email information including:
  - Subject and body preview
  - Sender and recipient information
  - Received timestamp
  - Read status
  - Importance level

#### Permissions Required
- `Mail.Read`: Read user mail
- `Mail.ReadWrite`: Read and write user mail
- `Mail.Send`: Send mail as user
- `MailboxSettings.Read`: Read user mailbox settings
- `MailboxSettings.ReadWrite`: Read and write user mailbox settings
- `User.Read`: Read user profile

#### Sync Behavior
- Syncs the 50 most recent messages
- Orders messages by received date (newest first)
- Includes message metadata and preview
- Automatic token refresh when needed

## API Endpoints

### Authentication

#### Initiate OAuth Flow
```http
POST /api/integrations/oauth/initiate/
Content-Type: application/json

{
  "provider": "microsoft_calendar" // or "microsoft_outlook"
}
```

#### OAuth Callback
```http
POST /api/integrations/oauth/callback/
Content-Type: application/json

{
  "code": "authorization_code",
  "provider": "microsoft_calendar",
  "state": "state_parameter"
}
```

### Data Sync

#### Manual Sync
```http
POST /api/integrations/{integration_id}/sync/
Content-Type: application/json

{
  "sync_type": "full" // or "calendar" or "email"
}
```

#### Get Calendar Events
```http
GET /api/integrations/calendar-events/
?provider=microsoft_calendar
&start_date=2024-01-01T00:00:00Z
&end_date=2024-01-31T23:59:59Z
```

#### Get Email Messages
```http
GET /api/integrations/email-messages/
?provider=microsoft_outlook
&is_read=false
&search=important
```

## Security Considerations

### Token Storage
- Access and refresh tokens are encrypted using Fernet encryption
- Tokens are stored securely in the database
- Automatic token refresh prevents expired token issues

### Permissions
- Follow the principle of least privilege
- Only request necessary permissions for your use case
- Users can revoke access at any time through their Microsoft account

### Data Privacy
- All API calls use HTTPS encryption
- User data is only accessed with explicit consent
- Sync data is stored locally and not shared with third parties

## Troubleshooting

### Common Issues

#### "Invalid client" Error
- Verify your `MICROSOFT_CLIENT_ID` is correct
- Ensure the client ID matches your Azure app registration
- Check that the app is not disabled in Azure

#### "Invalid redirect URI" Error
- Verify redirect URIs in Azure app registration match your application URLs
- Ensure both development and production URLs are configured
- Check for trailing slashes or protocol mismatches

#### "Insufficient privileges" Error
- Verify all required API permissions are granted in Azure
- Ensure admin consent is provided for organization-wide permissions
- Check that the user has necessary permissions in their Microsoft account

#### Token Refresh Issues
- Verify `MICROSOFT_CLIENT_SECRET` is correct and not expired
- Check that the refresh token is properly stored
- Ensure the app registration allows offline access

### Debug Mode

Enable debug logging to troubleshoot issues:

```python
# In Django settings
LOGGING = {
    'loggers': {
        'apps.integrations': {
            'level': 'DEBUG',
        },
    },
}
```

## Rate Limits

Microsoft Graph API has rate limits:
- **Calendar API**: 10,000 requests per 10 minutes per app per tenant
- **Mail API**: 10,000 requests per 10 minutes per app per tenant

The integration handles rate limiting automatically with exponential backoff.

## Support

For additional help:
1. Check the [Microsoft Graph documentation](https://docs.microsoft.com/en-us/graph/)
2. Review Azure app registration settings
3. Check application logs for detailed error messages
4. Verify environment variables are correctly set

## Next Steps

- Set up webhook notifications for real-time updates
- Implement calendar event creation and modification
- Add email sending capabilities
- Configure advanced filtering and search options