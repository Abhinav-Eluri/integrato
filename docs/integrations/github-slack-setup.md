# GitHub + Slack Integration Setup

This guide will help you set up both GitHub and Slack integrations to work together in your application.

## Prerequisites

- A GitHub account with admin access to repositories you want to integrate
- A Slack workspace where you have permission to install apps
- Your application running locally or deployed

## GitHub Setup

### 1. Create a GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your App Name - GitHub Integration
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/integrations/oauth/callback`
4. Click "Register application"
5. Note down the **Client ID** and generate a **Client Secret**

### 2. Configure GitHub Environment Variables

Add these to your `.env` file:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 3. GitHub Permissions

The GitHub integration requests these scopes:
- `repo` - Access to repositories
- `user:email` - Access to user email addresses
- `read:org` - Read access to organization membership

## Slack Setup

### 1. Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter your app name and select your workspace
4. Click "Create App"

### 2. Configure OAuth & Permissions

1. In your app settings, go to "OAuth & Permissions"
2. Add these redirect URLs:
   - `http://localhost:3000/integrations/oauth/callback` (development)
   - `https://yourdomain.com/integrations/oauth/callback` (production)

3. Add these OAuth scopes under "Bot Token Scopes":
   - `channels:read` - View basic information about public channels
   - `chat:write` - Send messages as the app
   - `users:read` - View people in the workspace
   - `users:read.email` - View email addresses of people in the workspace

### 3. Configure Slack Environment Variables

Add these to your `.env` file:

```env
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
```

## Integration Features

### GitHub Integration Capabilities

- **Repository Management**: Access and manage repositories
- **Issue Tracking**: Create, update, and monitor issues
- **Pull Request Monitoring**: Track PR status and reviews
- **Commit History**: Access commit information and diffs
- **Webhook Support**: Real-time notifications for repository events

### Slack Integration Capabilities

- **Channel Management**: Access channel information
- **Message Posting**: Send automated messages and notifications
- **User Information**: Access workspace member details
- **Bot Integration**: Deploy custom bots for automation

### Combined GitHub + Slack Workflows

1. **PR Notifications**: Automatically notify Slack channels when:
   - New pull requests are created
   - PRs are approved or merged
   - Code reviews are requested

2. **Issue Tracking**: Send Slack notifications for:
   - New GitHub issues
   - Issue assignments
   - Issue status changes

3. **Deployment Alerts**: Notify teams about:
   - Successful deployments
   - Build failures
   - Release notifications

4. **Code Review Reminders**: Automated Slack reminders for:
   - Pending code reviews
   - Stale pull requests
   - Review assignments

## Testing the Integration

### 1. Start Your Application

```bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend
npm start
```

### 2. Connect GitHub

1. Navigate to the integrations page
2. Click "Connect" on the GitHub card
3. Authorize the application in GitHub
4. Verify the connection status shows "Connected"

### 3. Connect Slack

1. Click "Connect" on the Slack card
2. Select your Slack workspace
3. Authorize the required permissions
4. Verify the connection status shows "Connected"

### 4. Test Combined Functionality

1. Create a test repository in GitHub
2. Set up a Slack channel for notifications
3. Configure webhook endpoints to link GitHub events to Slack messages
4. Test by creating a pull request and verifying Slack notifications

## Troubleshooting

### Common GitHub Issues

- **Invalid redirect URI**: Ensure the callback URL in GitHub matches your application URL
- **Insufficient permissions**: Verify the OAuth app has the required scopes
- **Rate limiting**: GitHub API has rate limits; implement proper error handling

### Common Slack Issues

- **App not installed**: Ensure the Slack app is installed in your workspace
- **Missing scopes**: Verify all required OAuth scopes are configured
- **Channel permissions**: Bot needs to be added to channels where it will post

### Integration Issues

- **Token expiration**: Implement refresh token logic for long-term access
- **Webhook failures**: Ensure your application can receive and process webhooks
- **Network connectivity**: Verify your application can reach both GitHub and Slack APIs

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Token Storage**: Encrypt tokens in your database
3. **Webhook Validation**: Verify webhook signatures from GitHub and Slack
4. **Scope Limitation**: Request only the minimum required permissions
5. **Regular Audits**: Periodically review connected applications and permissions

## Next Steps

- Explore advanced webhook configurations
- Set up custom Slack commands
- Implement GitHub Actions integration
- Create custom notification rules
- Build automated workflow triggers