# Google OAuth Setup Guide

This guide will walk you through the process of setting up Google OAuth authentication for your application.

## Prerequisites

- A Google account
- Access to the Google Cloud Console
- Your application's domain/URL (for production) or localhost (for development)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "My Auth App")
5. Select your organization (if applicable)
6. Click "Create"

## Step 2: Enable the People API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "People API"
3. Click on "People API" from the results
4. Click "Enable"

**Note:** Google+ API is deprecated. This implementation uses the People API for retrieving user profile information.

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" for user type (unless you're using Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Your application name
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **App domain**: Your website domain
   - **Authorized domains**: Add your domain (e.g., `localhost` for development)
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
8. Click "Update" and then "Save and Continue"
9. On the "Test users" page (if in testing mode), add test user emails
10. Click "Save and Continue"
11. Review your settings and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name for your OAuth client (e.g., "Web Client")
5. Add Authorized JavaScript origins:
   - For development: `http://localhost:3000` and `http://localhost:5173`
   - For production: `https://yourdomain.com`
6. Add Authorized redirect URIs:
   - For development: `http://localhost:5173` (frontend URL)
   - For production: `https://yourdomain.com` (frontend URL)
   
**Note:** This implementation uses a custom backend endpoint (`/api/auth/google/`) rather than traditional OAuth redirects.
7. Click "Create"

## Step 5: Get Your Credentials

After creating the OAuth client, you'll see a modal with your credentials:

- **Client ID**: A long string ending in `.apps.googleusercontent.com`
- **Client Secret**: A shorter string of random characters

**Important**: Copy these values immediately and store them securely.

## Step 6: Configure Your Application

### Backend Configuration

1. Open your `.env` file in the backend directory
2. Add the following environment variables:

```env
GOOGLE_OAUTH2_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_OAUTH2_CLIENT_SECRET=your-client-secret-here
```

### Django Settings

Your `settings.py` should include the Google OAuth credentials:

```python
# Google OAuth Settings
GOOGLE_OAUTH2_CLIENT_ID = os.getenv('GOOGLE_OAUTH2_CLIENT_ID')
GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv('GOOGLE_OAUTH2_CLIENT_SECRET')
```

### Frontend Configuration

Your frontend `.env` file should include:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## Step 7: Implementation Details

### Backend Implementation

The backend includes a custom Google OAuth endpoint at `/api/auth/google/` that:

1. **Receives Google Access Token**: Frontend sends the Google access token
2. **Verifies Token**: Uses Google's People API to verify the token
3. **Retrieves User Info**: Gets user profile data from Google
4. **Creates/Updates User**: Creates new user or updates existing user
5. **Issues JWT Tokens**: Returns application JWT tokens for authentication

### Frontend Implementation

The frontend integration includes:

1. **Google OAuth Button**: Uses Google OAuth library for authentication
2. **Token Handling**: Receives access token from Google
3. **Backend Communication**: Sends token to custom backend endpoint
4. **State Management**: Updates authentication state with user data
5. **Token Storage**: Stores JWT tokens for subsequent API calls

## Step 8: Test Your Setup

1. Start your Django backend server:
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. Start your frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to your login page and test the Google OAuth flow
4. Check the browser console and backend logs for any errors

## Troubleshooting

### Common Issues

1. **"Error 400: redirect_uri_mismatch"**
   - Check that your redirect URIs in Google Console match exactly with your application URLs
   - Ensure you're using the correct protocol (http vs https)

2. **"Error 403: access_blocked"**
   - Your OAuth consent screen might not be published
   - Add your test email to the test users list

3. **"Error 401: invalid_client"**
   - Check that your Client ID and Client Secret are correct
   - Ensure there are no extra spaces or characters

4. **"Error 500: Internal Server Error"**
   - Check backend logs for detailed error messages
   - Ensure all required imports are present (e.g., `requests`, `timezone`)
   - Verify environment variables are correctly set

5. **"Error 415: Unsupported Media Type"**
   - Ensure your frontend is sending the correct Content-Type header (`application/json`)
   - Check that your API client is properly configured
   - Consider adding `@csrf_exempt` decorator to the view if using Django's CSRF protection

6. **"Error 405: Method Not Allowed"**
   - Verify the endpoint is decorated with the correct HTTP method (`@api_view(['POST'])`)
   - Check the URL configuration in your Django urls.py file

### Development vs Production

- **Development**: Use `http://localhost` URLs
- **Production**: Use `https://` URLs only
- Always update your authorized domains and redirect URIs when moving between environments

## Security Best Practices

1. **Never commit credentials to version control**
   - Use environment variables
   - Add `.env` to your `.gitignore` file

2. **Use different OAuth clients for different environments**
   - Create separate clients for development, staging, and production

3. **Regularly rotate your client secrets**
   - Google allows you to have multiple active secrets
   - Update your application before deleting old secrets

4. **Monitor your OAuth usage**
   - Check the Google Cloud Console for unusual activity
   - Set up quotas and alerts

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Django Allauth Google Provider](https://django-allauth.readthedocs.io/en/latest/providers.html#google)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:

1. Check the Django logs for detailed error messages
2. Verify your Google Cloud Console configuration
3. Ensure your environment variables are loaded correctly
4. Test with a fresh incognito/private browser window