# Calendly Integration Setup Guide

This guide will help you set up Calendly integration for your application.

## Prerequisites

- A Calendly account (Personal, Essentials, Professional, or Teams plan)
- Access to Calendly Developer Portal
- Your application running locally or deployed

## Step 1: Create a Calendly OAuth App

1. **Access Developer Portal**
   - Go to [Calendly Developer Portal](https://developer.calendly.com/)
   - Sign in with your Calendly account
   - Navigate to "My Apps" section

2. **Create New App**
   - Click "Create New App"
   - Fill in the required information:
     - **App Name**: Your application name
     - **Description**: Brief description of your app
     - **Website URL**: Your application's website

3. **Configure OAuth Settings**
   - **Redirect URIs**: Add your callback URL
     - For local development: `http://localhost:8000/api/integrations/oauth/callback/`
     - For production: `https://yourdomain.com/api/integrations/oauth/callback/`
   - **Scopes**: Select the permissions your app needs
     - `default`: Basic access to user information
     - Additional scopes as needed for your use case

4. **Save and Get Credentials**
   - Save your app configuration
   - Copy the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

1. **Backend Configuration**
   - Copy the example environment file:
     ```bash
     cp backend/.env.calendly backend/.env.local
     ```
   
   - Update the values in `backend/.env.local`:
     ```env
     CALENDLY_CLIENT_ID=your_actual_client_id
     CALENDLY_CLIENT_SECRET=your_actual_client_secret
     CALENDLY_REDIRECT_URI=http://localhost:8000/api/integrations/oauth/callback/
     CALENDLY_SCOPES=default
     ```

2. **Load Environment Variables**
   - Make sure your Django settings load these variables
   - Add to your main `.env` file or load the `.env.local` file

## Step 3: Database Migration

Run the database migration to add Calendly to the provider choices:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Step 4: Test the Integration

1. **Start the Servers**
   ```bash
   # Backend
   cd backend
   python manage.py runserver
   
   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

2. **Test OAuth Flow**
   - Navigate to your application
   - Go to the integrations page
   - Click "Connect" on the Calendly integration
   - You should be redirected to Calendly for authorization
   - After authorization, you should be redirected back to your app

## Calendly API Capabilities

Once integrated, you can access:

### User Information
- User profile details
- Organization information
- Timezone and availability preferences

### Event Types
- List user's event types
- Get event type details
- Access booking page URLs

### Scheduled Events
- List scheduled events
- Get event details
- Access invitee information

### Webhooks (Advanced)
- Set up real-time notifications
- Listen for booking events
- Handle cancellations and reschedules

## API Scopes

| Scope | Description |
|-------|-------------|
| `default` | Basic access to user information |
| `read:user` | Read user profile information |
| `read:event_types` | Read user's event types |
| `read:scheduled_events` | Read scheduled events |
| `read:organization` | Read organization information |

## Rate Limits

- **API Rate Limit**: 1000 requests per hour per user
- **OAuth Rate Limit**: 100 requests per hour per app

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" Error**
   - Ensure the redirect URI in your Calendly app matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client" Error**
   - Verify your Client ID and Client Secret are correct
   - Ensure environment variables are loaded properly

3. **"Insufficient scope" Error**
   - Check that your app has the required scopes
   - Re-authorize if you've added new scopes

4. **Token Refresh Issues**
   - Calendly access tokens expire after 2 hours
   - Implement proper token refresh logic
   - Store refresh tokens securely

### Debug Steps

1. **Check Environment Variables**
   ```bash
   python manage.py shell
   >>> from django.conf import settings
   >>> print(settings.CALENDLY_CLIENT_ID)
   ```

2. **Test API Connection**
   ```bash
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
        https://api.calendly.com/users/me
   ```

3. **Check Logs**
   - Monitor Django logs for OAuth errors
   - Check browser network tab for failed requests

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to version control
   - Use different credentials for development and production
   - Rotate secrets regularly

2. **Token Storage**
   - Store tokens securely in your database
   - Encrypt sensitive data at rest
   - Implement proper access controls

3. **HTTPS**
   - Always use HTTPS in production
   - Ensure redirect URIs use HTTPS

## Resources

- [Calendly API Documentation](https://developer.calendly.com/api-docs/)
- [OAuth 2.0 Guide](https://developer.calendly.com/api-docs/ZG9jOjM2MzE2MDM4-oauth)
- [API Reference](https://developer.calendly.com/api-docs/reference)
- [Webhooks Guide](https://developer.calendly.com/api-docs/ZG9jOjM2MzE2MDM5-webhooks)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Calendly's developer documentation
3. Contact Calendly developer support
4. Check your application logs for detailed error messages