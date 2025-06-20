# Slack Integration Setup

This guide covers setting up Slack integrations for messaging, channels, and workspace management in your application.

## Prerequisites

- Slack workspace with admin permissions
- Basic understanding of Slack API and OAuth 2.0
- HTTPS endpoint for webhooks (required for production)

## 1. Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App**
3. Choose **From scratch**
4. Configure:
   - **App Name**: `Integrato`
   - **Pick a workspace**: Select your development workspace
5. Click **Create App**

## 2. Configure OAuth & Permissions

### Bot Token Scopes
1. Go to **OAuth & Permissions** in your app settings
2. Scroll to **Scopes** → **Bot Token Scopes**
3. Add the following scopes:

#### Basic Permissions
```
app_mentions:read
channels:history
channels:read
channels:write
chat:write
chat:write.public
files:read
files:write
groups:history
groups:read
groups:write
im:history
im:read
im:write
mpim:history
mpim:read
mpim:write
```

#### User Information
```
users:read
users:read.email
users.profile:read
team:read
```

#### Advanced Features (Optional)
```
reactions:read
reactions:write
reminders:read
reminders:write
workflow.steps:execute
```

### User Token Scopes (if needed)
4. Add **User Token Scopes** for user-specific actions:
```
channels:read
channels:write
chat:write
files:read
files:write
users:read
```

### Redirect URLs
5. Add **Redirect URLs**:
```
http://localhost:3000/auth/slack/callback
https://yourdomain.com/auth/slack/callback
```

## 3. Install App to Workspace

1. In **OAuth & Permissions**, click **Install to Workspace**
2. Review permissions and click **Allow**
3. **Save the Bot User OAuth Token** - starts with `xoxb-`
4. **Save the User OAuth Token** (if applicable) - starts with `xoxp-`

## 4. Configure App Settings

### Basic Information
1. Go to **Basic Information**
2. Note down:
   - **Client ID**
   - **Client Secret**
   - **Signing Secret**
   - **Verification Token** (legacy)

### App Home
3. Go to **App Home**
4. Configure:
   - **Home Tab**: Enable if you want a custom home experience
   - **Messages Tab**: Enable for direct messaging
   - **Always Show My Bot as Online**: Enable

## 5. Set Up Event Subscriptions

1. Go to **Event Subscriptions**
2. **Enable Events**: Toggle on
3. **Request URL**: `https://yourdomain.com/webhooks/slack/events`
4. **Subscribe to bot events**:
```
app_mention
message.channels
message.groups
message.im
message.mpim
reaction_added
reaction_removed
file_shared
team_join
user_change
```

5. **Subscribe to workspace events** (if needed):
```
channel_created
channel_deleted
channel_rename
team_domain_change
```

## 6. Configure Slash Commands (Optional)

1. Go to **Slash Commands**
2. Click **Create New Command**
3. Configure:
   - **Command**: `/integrato`
   - **Request URL**: `https://yourdomain.com/webhooks/slack/commands`
   - **Short Description**: `Integrato commands`
   - **Usage Hint**: `[action] [parameters]`

## 7. Set Up Interactive Components

1. Go to **Interactivity & Shortcuts**
2. **Enable Interactivity**: Toggle on
3. **Request URL**: `https://yourdomain.com/webhooks/slack/interactive`
4. **Options Load URL**: `https://yourdomain.com/webhooks/slack/options` (if using dynamic menus)

### Message Shortcuts
5. Add **Message Shortcuts**:
   - **Name**: `Save to Integrato`
   - **Short Description**: `Save message to Integrato`
   - **Callback ID**: `save_message`

### Global Shortcuts
6. Add **Global Shortcuts**:
   - **Name**: `Create Task`
   - **Short Description**: `Create a new task`
   - **Callback ID**: `create_task`

## 8. Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
# Slack OAuth
SLACK_CLIENT_ID=your_client_id_here
SLACK_CLIENT_SECRET=your_client_secret_here
SLACK_SIGNING_SECRET=your_signing_secret_here
SLACK_VERIFICATION_TOKEN=your_verification_token_here

# Slack Bot Token (for your workspace)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here

# Slack API
SLACK_API_BASE_URL=https://slack.com/api
```

### Frontend (.env)
```env
# Slack OAuth
VITE_SLACK_CLIENT_ID=your_client_id_here
```

## 9. Slack API Endpoints

### Authentication
```
# OAuth flow
GET https://slack.com/oauth/v2/authorize
POST https://slack.com/api/oauth.v2.access
```

### Messaging
```
# Send message
POST https://slack.com/api/chat.postMessage

# Update message
POST https://slack.com/api/chat.update

# Delete message
POST https://slack.com/api/chat.delete

# Get conversation history
GET https://slack.com/api/conversations.history
```

### Channels
```
# List channels
GET https://slack.com/api/conversations.list

# Create channel
POST https://slack.com/api/conversations.create

# Join channel
POST https://slack.com/api/conversations.join

# Get channel info
GET https://slack.com/api/conversations.info
```

### Users
```
# Get user info
GET https://slack.com/api/users.info

# List users
GET https://slack.com/api/users.list

# Get user profile
GET https://slack.com/api/users.profile.get
```

### Files
```
# Upload file
POST https://slack.com/api/files.upload

# Get file info
GET https://slack.com/api/files.info

# List files
GET https://slack.com/api/files.list
```

## 10. Rate Limits

### Slack API Rate Limits
- **Tier 1**: 1+ requests per minute
- **Tier 2**: 20+ requests per minute
- **Tier 3**: 50+ requests per minute
- **Tier 4**: 100+ requests per minute

### Best Practices
1. Respect `Retry-After` headers
2. Implement exponential backoff
3. Use bulk operations when possible
4. Cache user and channel information

## 11. Webhook Event Handling

### Event Structure
```json
{
  "token": "verification_token",
  "team_id": "T1234567890",
  "api_app_id": "A1234567890",
  "event": {
    "type": "message",
    "channel": "C1234567890",
    "user": "U1234567890",
    "text": "Hello world",
    "ts": "1234567890.123456"
  },
  "type": "event_callback",
  "event_id": "Ev1234567890",
  "event_time": 1234567890
}
```

### Verification
1. **URL Verification**: Respond to challenge parameter
2. **Request Signing**: Verify requests using signing secret
3. **Token Verification**: Check verification token (legacy)

## 12. Block Kit UI Components

### Message Blocks
```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hello from Integrato! :wave:"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      ]
    }
  ]
}
```

### Modal Views
```json
{
  "type": "modal",
  "title": {
    "type": "plain_text",
    "text": "Create Task"
  },
  "blocks": [
    {
      "type": "input",
      "element": {
        "type": "plain_text_input",
        "action_id": "task_title"
      },
      "label": {
        "type": "plain_text",
        "text": "Task Title"
      }
    }
  ],
  "submit": {
    "type": "plain_text",
    "text": "Create"
  }
}
```

## 13. Security Best Practices

### Request Verification
1. **Verify signing secret** for all incoming requests
2. **Check timestamp** to prevent replay attacks
3. **Validate tokens** for API calls

### Token Management
1. **Rotate tokens** regularly
2. **Store tokens securely** (encrypted)
3. **Use workspace-specific tokens**
4. **Implement token refresh** for user tokens

## 14. Testing and Development

### Slack CLI
1. Install Slack CLI: `npm install -g @slack/cli`
2. Create local development app
3. Test webhooks locally with ngrok

### Testing Tools
1. **Block Kit Builder**: Design and test UI components
2. **API Tester**: Test API calls
3. **Webhook Tester**: Test event handling

## 15. Distribution and App Store

### Prepare for Distribution
1. **App Directory Listing**:
   - App icon and screenshots
   - Detailed description
   - Privacy policy and terms
   - Support contact information

2. **Security Review**:
   - Data handling practices
   - Permission justification
   - Compliance documentation

### Submission Process
1. Complete app directory form
2. Submit for review
3. Address feedback
4. Publish to Slack App Directory

## 16. Common Issues and Solutions

### "invalid_auth" Error
- Check token format and validity
- Ensure proper scopes are granted
- Verify workspace installation

### "channel_not_found" Error
- Verify channel ID format
- Check bot permissions for channel
- Ensure channel exists and is accessible

### Webhook Verification Failed
- Check signing secret configuration
- Verify request timestamp
- Ensure proper signature calculation

## 17. Monitoring and Analytics

### Slack Analytics
1. Monitor app usage in workspace
2. Track user engagement
3. Review error rates

### Custom Metrics
1. API call frequency
2. Response times
3. Error rates by endpoint
4. User adoption metrics

## 18. Sample Code Structure

### Backend Service Class
```python
class SlackService:
    def __init__(self, bot_token):
        self.bot_token = bot_token
        self.client = WebClient(token=bot_token)
    
    def send_message(self, channel, text, blocks=None):
        # Implementation
        pass
    
    def get_channel_history(self, channel, limit=100):
        # Implementation
        pass
    
    def upload_file(self, channels, file_path, title=None):
        # Implementation
        pass
```

## 19. Next Steps

1. Implement OAuth 2.0 flow for workspace installation
2. Create webhook endpoints for events and interactions
3. Build Block Kit UI components
4. Set up proper error handling and logging
5. Implement rate limiting and retry logic
6. Test with multiple workspaces
7. Prepare for app store submission

## Useful Links

- [Slack API Documentation](https://api.slack.com/)
- [Block Kit Builder](https://app.slack.com/block-kit-builder/)
- [Slack SDK for Python](https://slack.dev/python-slack-sdk/)
- [Slack SDK for Node.js](https://slack.dev/node-slack-sdk/)
- [App Distribution Guide](https://api.slack.com/start/distributing)