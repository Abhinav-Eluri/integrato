# Trello Integration Setup

This guide covers setting up Trello integrations for boards, cards, lists, and project management features in your application.

## Prerequisites

- Trello account
- Basic understanding of Trello's structure (boards, lists, cards)
- Understanding of OAuth 1.0a for authentication
- HTTPS endpoint for webhooks

## 1. Create Trello Power-Up/Application

1. Go to [Trello Developer Portal](https://trello.com/app-key)
2. Generate your **API Key**
3. Click on **Token** link to generate a token for testing
4. For production, you'll need to implement OAuth 1.0a flow

### Get API Credentials
1. **API Key**: Your application identifier
2. **API Secret**: Keep this secure (for OAuth)
3. **Token**: For server-to-server authentication (testing)

## 2. OAuth 1.0a Setup (Production)

### OAuth Flow URLs
```
# Request token
POST https://trello.com/1/OAuthGetRequestToken

# Authorization URL
https://trello.com/1/OAuthAuthorizeToken?oauth_token={REQUEST_TOKEN}&name={APP_NAME}&scope={SCOPE}&expiration={EXPIRATION}

# Access token
POST https://trello.com/1/OAuthGetAccessToken
```

### OAuth Parameters
- **scope**: `read`, `write`, `account`
- **expiration**: `1hour`, `1day`, `30days`, `never`
- **name**: Your application name

## 3. Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
# Trello API Credentials
TRELLO_API_KEY=your_api_key_here
TRELLO_API_SECRET=your_api_secret_here
TRELLO_API_TOKEN=your_api_token_here  # For testing

# Trello OAuth (Production)
TRELLO_OAUTH_CALLBACK_URL=http://localhost:8000/auth/trello/callback/

# Trello API
TRELLO_API_BASE_URL=https://api.trello.com/1
TRELLO_WEBHOOK_CALLBACK_URL=https://yourdomain.com/webhooks/trello/
```

### Frontend (.env)
```env
# Trello OAuth
VITE_TRELLO_API_KEY=your_api_key_here
VITE_TRELLO_AUTH_URL=https://trello.com/1/authorize
```

## 4. Trello API Endpoints

### Authentication
```
# Get member info (verify token)
GET /members/me?key={key}&token={token}
```

### Boards
```
# Get user's boards
GET /members/me/boards?key={key}&token={token}

# Get board
GET /boards/{board_id}?key={key}&token={token}

# Create board
POST /boards?key={key}&token={token}

# Update board
PUT /boards/{board_id}?key={key}&token={token}

# Delete board
DELETE /boards/{board_id}?key={key}&token={token}
```

### Lists
```
# Get board lists
GET /boards/{board_id}/lists?key={key}&token={token}

# Get list
GET /lists/{list_id}?key={key}&token={token}

# Create list
POST /lists?key={key}&token={token}

# Update list
PUT /lists/{list_id}?key={key}&token={token}

# Archive list
PUT /lists/{list_id}/closed?key={key}&token={token}
```

### Cards
```
# Get list cards
GET /lists/{list_id}/cards?key={key}&token={token}

# Get card
GET /cards/{card_id}?key={key}&token={token}

# Create card
POST /cards?key={key}&token={token}

# Update card
PUT /cards/{card_id}?key={key}&token={token}

# Delete card
DELETE /cards/{card_id}?key={key}&token={token}

# Move card
PUT /cards/{card_id}?key={key}&token={token}
```

### Members
```
# Get board members
GET /boards/{board_id}/members?key={key}&token={token}

# Add member to board
PUT /boards/{board_id}/members/{member_id}?key={key}&token={token}

# Remove member from board
DELETE /boards/{board_id}/members/{member_id}?key={key}&token={token}

# Add member to card
POST /cards/{card_id}/idMembers?key={key}&token={token}
```

### Labels
```
# Get board labels
GET /boards/{board_id}/labels?key={key}&token={token}

# Create label
POST /labels?key={key}&token={token}

# Add label to card
POST /cards/{card_id}/idLabels?key={key}&token={token}

# Remove label from card
DELETE /cards/{card_id}/idLabels/{label_id}?key={key}&token={token}
```

### Checklists
```
# Get card checklists
GET /cards/{card_id}/checklists?key={key}&token={token}

# Create checklist
POST /checklists?key={key}&token={token}

# Add checklist to card
POST /cards/{card_id}/checklists?key={key}&token={token}

# Create checklist item
POST /checklists/{checklist_id}/checkItems?key={key}&token={token}

# Update checklist item
PUT /cards/{card_id}/checkItem/{checkitem_id}?key={key}&token={token}
```

### Attachments
```
# Get card attachments
GET /cards/{card_id}/attachments?key={key}&token={token}

# Add attachment
POST /cards/{card_id}/attachments?key={key}&token={token}

# Delete attachment
DELETE /cards/{card_id}/attachments/{attachment_id}?key={key}&token={token}
```

### Comments (Actions)
```
# Get card comments
GET /cards/{card_id}/actions?filter=commentCard&key={key}&token={token}

# Add comment
POST /cards/{card_id}/actions/comments?key={key}&token={token}

# Update comment
PUT /actions/{action_id}?key={key}&token={token}

# Delete comment
DELETE /actions/{action_id}?key={key}&token={token}
```

## 5. Working with Boards

### Create Board
```json
{
  "name": "Project Board",
  "desc": "Board for managing project tasks",
  "defaultLabels": true,
  "defaultLists": true,
  "prefs_permissionLevel": "private",
  "prefs_voting": "disabled",
  "prefs_comments": "members",
  "prefs_invitations": "members",
  "prefs_selfJoin": true,
  "prefs_cardCovers": true,
  "prefs_background": "blue",
  "prefs_cardAging": "regular"
}
```

### Board Preferences
```json
{
  "prefs_permissionLevel": "private",  // private, org, public
  "prefs_voting": "disabled",          // disabled, members, observers, org, public
  "prefs_comments": "members",         // disabled, members, observers, org, public
  "prefs_invitations": "members",      // members, admins
  "prefs_selfJoin": true,              // boolean
  "prefs_cardCovers": true,            // boolean
  "prefs_background": "blue",          // color or image ID
  "prefs_cardAging": "regular"         // pirate, regular
}
```

## 6. Working with Lists

### Create List
```json
{
  "name": "To Do",
  "idBoard": "board_id_here",
  "pos": "top"  // top, bottom, or number
}
```

### List Positions
- **top**: Move to top
- **bottom**: Move to bottom
- **number**: Specific position (e.g., 1, 2, 3)

## 7. Working with Cards

### Create Card
```json
{
  "name": "Task Title",
  "desc": "Detailed task description",
  "idList": "list_id_here",
  "pos": "top",
  "due": "2024-01-01T12:00:00.000Z",
  "dueComplete": false,
  "idMembers": ["member_id_1", "member_id_2"],
  "idLabels": ["label_id_1", "label_id_2"],
  "urlSource": "https://example.com",
  "fileSource": null,
  "idCardSource": null,
  "keepFromSource": "all"
}
```

### Update Card
```json
{
  "name": "Updated Task Title",
  "desc": "Updated description",
  "closed": false,
  "idList": "new_list_id",
  "pos": "bottom",
  "due": "2024-01-15T12:00:00.000Z",
  "dueComplete": true
}
```

### Move Card Between Lists
```json
{
  "idList": "target_list_id",
  "pos": "top"
}
```

### Card Positions
- **top**: Move to top of list
- **bottom**: Move to bottom of list
- **number**: Specific position in list

## 8. Working with Labels

### Create Label
```json
{
  "name": "Priority: High",
  "color": "red",
  "idBoard": "board_id_here"
}
```

### Label Colors
```
green, yellow, orange, red, purple, blue, sky, lime, pink, black
```

### Add Label to Card
```json
{
  "value": "label_id_here"
}
```

## 9. Working with Checklists

### Create Checklist
```json
{
  "name": "Task Checklist",
  "idCard": "card_id_here",
  "pos": "top"
}
```

### Add Checklist Item
```json
{
  "name": "Checklist item text",
  "pos": "bottom",
  "checked": false
}
```

### Update Checklist Item
```json
{
  "state": "complete",  // complete, incomplete
  "name": "Updated item text"
}
```

## 10. Working with Attachments

### Add URL Attachment
```json
{
  "url": "https://example.com/document.pdf",
  "name": "Project Document"
}
```

### Add File Attachment
```
POST /cards/{card_id}/attachments
Content-Type: multipart/form-data

file: [binary file data]
name: "filename.pdf"
```

## 11. Working with Comments

### Add Comment
```json
{
  "text": "This is a comment on the card."
}
```

### Update Comment
```json
{
  "text": "This is an updated comment."
}
```

## 12. Webhooks

### Create Webhook
```json
{
  "description": "Board webhook",
  "callbackURL": "https://yourdomain.com/webhooks/trello/",
  "idModel": "board_id_here",
  "active": true
}
```

### Webhook Events
```
# Board events
createBoard, updateBoard, deleteBoard

# List events
createList, updateList, deleteList

# Card events
createCard, updateCard, deleteCard, moveCard

# Member events
addMemberToBoard, removeMemberFromBoard
addMemberToCard, removeMemberFromCard

# Label events
addLabelToCard, removeLabelFromCard

# Checklist events
addChecklistToCard, removeChecklistFromCard
updateCheckItemStateOnCard

# Attachment events
addAttachmentToCard, deleteAttachmentFromCard

# Comment events
commentCard
```

### Webhook Payload Example
```json
{
  "action": {
    "id": "action_id",
    "idMemberCreator": "member_id",
    "data": {
      "card": {
        "id": "card_id",
        "name": "Card Name"
      },
      "list": {
        "id": "list_id",
        "name": "List Name"
      },
      "board": {
        "id": "board_id",
        "name": "Board Name"
      }
    },
    "type": "createCard",
    "date": "2024-01-01T12:00:00.000Z",
    "memberCreator": {
      "id": "member_id",
      "username": "username",
      "fullName": "Full Name"
    }
  },
  "model": {
    "id": "board_id",
    "name": "Board Name"
  }
}
```

## 13. Rate Limits

### Trello API Rate Limits
- **Rate limit**: 300 requests per 10 seconds per API key
- **Daily limit**: 100,000 requests per day per API key
- **Burst limit**: Up to 100 requests in quick succession

### Rate Limit Headers
```
X-Rate-Limit-Api-Key-Interval-Ms: 10000
X-Rate-Limit-Api-Key-Max: 300
X-Rate-Limit-Api-Key-Remaining: 299
X-Rate-Limit-Api-Token-Interval-Ms: 10000
X-Rate-Limit-Api-Token-Max: 100
X-Rate-Limit-Api-Token-Remaining: 99
```

### Best Practices
1. Monitor rate limit headers
2. Implement exponential backoff
3. Use webhooks instead of polling
4. Cache responses when appropriate
5. Batch operations when possible

## 14. Error Handling

### Common Error Codes
```
200: Success
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
429: Too Many Requests
500: Internal Server Error
```

### Error Response Format
```json
{
  "message": "invalid key",
  "error": "UNAUTHORIZED"
}
```

### Common Errors
- **invalid key**: API key is invalid
- **invalid token**: Token is invalid or expired
- **unauthorized permission requested**: Insufficient permissions
- **invalid id**: Resource ID is invalid
- **rate limit exceeded**: Too many requests

## 15. Search and Filtering

### Search Cards
```
GET /search?query={query}&key={key}&token={token}
```

### Search Parameters
```
# Search in specific board
board:board_id

# Search by member
@username

# Search by label
label:"label name"

# Search by due date
due:day, due:week, due:month
due:overdue, due:complete

# Search by list
list:"list name"

# Search by card state
is:open, is:archived

# Search by creation date
created:day, created:week, created:month

# Search by edit date
edited:day, edited:week, edited:month
```

### Example Search Queries
```
# Cards assigned to user in specific board
board:board_id @username

# Overdue cards with high priority label
due:overdue label:"Priority: High"

# Cards in "In Progress" list
list:"In Progress"

# Recently created cards
created:week
```

## 16. Power-Ups Integration

### Board Power-Ups
```
# Get board power-ups
GET /boards/{board_id}/boardPlugins?key={key}&token={token}

# Enable power-up
POST /boards/{board_id}/boardPlugins?key={key}&token={token}

# Disable power-up
DELETE /boards/{board_id}/boardPlugins/{plugin_id}?key={key}&token={token}
```

### Custom Fields (Power-Up)
```
# Get custom fields
GET /boards/{board_id}/customFields?key={key}&token={token}

# Create custom field
POST /customFields?key={key}&token={token}

# Update custom field value
PUT /cards/{card_id}/customField/{field_id}/item?key={key}&token={token}
```

## 17. Security Best Practices

### API Key Security
1. **Store API keys securely** (environment variables)
2. **Use HTTPS** for all requests
3. **Implement token rotation** for long-lived tokens
4. **Monitor API usage** for suspicious activity

### OAuth Security
1. **Use secure callback URLs** (HTTPS)
2. **Validate state parameter** to prevent CSRF
3. **Store tokens securely** (encrypted)
4. **Implement proper token refresh**

### Webhook Security
1. **Verify webhook signatures** (if available)
2. **Use HTTPS endpoints** for webhooks
3. **Validate webhook payloads**
4. **Implement idempotency** for webhook processing

## 18. Testing and Development

### Testing Tools
1. **Postman**: Test API endpoints
2. **Trello API Explorer**: Interactive API testing
3. **ngrok**: Local webhook testing
4. **Webhook.site**: Webhook payload inspection

### Development Tips
1. **Start with personal token** for testing
2. **Use test boards** for development
3. **Implement proper error handling** early
4. **Test rate limiting** scenarios
5. **Validate webhook processing**

## 19. Common Use Cases

### Project Management
- Task tracking and assignment
- Sprint planning and management
- Progress reporting
- Team collaboration

### Content Planning
- Editorial calendars
- Content workflow management
- Review and approval processes
- Publishing schedules

### Customer Support
- Ticket tracking
- Issue prioritization
- Team assignment
- Resolution tracking

### Personal Productivity
- Personal task management
- Goal tracking
- Habit formation
- Project organization

## 20. Sample Code Structure

### Backend Service Class
```python
class TrelloService:
    def __init__(self, api_key, api_token):
        self.api_key = api_key
        self.api_token = api_token
        self.base_url = "https://api.trello.com/1"
    
    def _make_request(self, method, endpoint, data=None):
        url = f"{self.base_url}{endpoint}"
        params = {"key": self.api_key, "token": self.api_token}
        # Implementation
        pass
    
    def get_boards(self):
        return self._make_request("GET", "/members/me/boards")
    
    def get_board(self, board_id):
        return self._make_request("GET", f"/boards/{board_id}")
    
    def create_board(self, name, description=None):
        data = {"name": name}
        if description:
            data["desc"] = description
        return self._make_request("POST", "/boards", data)
    
    def get_lists(self, board_id):
        return self._make_request("GET", f"/boards/{board_id}/lists")
    
    def create_list(self, board_id, name, position="bottom"):
        data = {"name": name, "idBoard": board_id, "pos": position}
        return self._make_request("POST", "/lists", data)
    
    def get_cards(self, list_id):
        return self._make_request("GET", f"/lists/{list_id}/cards")
    
    def create_card(self, list_id, name, description=None, due_date=None):
        data = {"name": name, "idList": list_id}
        if description:
            data["desc"] = description
        if due_date:
            data["due"] = due_date
        return self._make_request("POST", "/cards", data)
    
    def update_card(self, card_id, **kwargs):
        return self._make_request("PUT", f"/cards/{card_id}", kwargs)
    
    def move_card(self, card_id, list_id, position="bottom"):
        data = {"idList": list_id, "pos": position}
        return self._make_request("PUT", f"/cards/{card_id}", data)
    
    def add_comment(self, card_id, text):
        data = {"text": text}
        return self._make_request("POST", f"/cards/{card_id}/actions/comments", data)
```

### Frontend Integration
```javascript
// OAuth authorization
const authorizeTrello = () => {
  const apiKey = process.env.VITE_TRELLO_API_KEY;
  const appName = 'Integrato';
  const scope = 'read,write';
  const expiration = '30days';
  const returnUrl = encodeURIComponent('http://localhost:3000/auth/trello/callback');
  
  const authUrl = `https://trello.com/1/authorize?` +
    `key=${apiKey}&` +
    `name=${appName}&` +
    `scope=${scope}&` +
    `expiration=${expiration}&` +
    `response_type=token&` +
    `return_url=${returnUrl}`;
  
  window.location.href = authUrl;
};

// API client
class TrelloClient {
  constructor(apiKey, token) {
    this.apiKey = apiKey;
    this.token = token;
    this.baseUrl = 'https://api.trello.com/1';
  }
  
  async makeRequest(method, endpoint, data = null) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('token', this.token);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    return response.json();
  }
  
  getBoards() {
    return this.makeRequest('GET', '/members/me/boards');
  }
  
  createCard(listId, name, description) {
    return this.makeRequest('POST', '/cards', {
      idList: listId,
      name,
      desc: description,
    });
  }
}
```

## 21. Monitoring and Analytics

### Usage Metrics
1. **API call frequency**
2. **Board and card creation rates**
3. **User engagement patterns**
4. **Feature usage statistics**

### Performance Monitoring
1. **Response times**
2. **Error rates**
3. **Rate limit utilization**
4. **Webhook delivery success**

## 22. Next Steps

1. Set up API credentials and test basic authentication
2. Implement board and list management
3. Build card creation and management features
4. Add member and label management
5. Implement checklist and attachment features
6. Set up webhook handling for real-time updates
7. Add search and filtering capabilities
8. Implement proper error handling and rate limiting
9. Test with various board configurations
10. Prepare for production deployment

## Useful Links

- [Trello API Documentation](https://developer.atlassian.com/cloud/trello/)
- [Trello REST API Reference](https://developer.atlassian.com/cloud/trello/rest/)
- [Trello Power-Ups](https://developer.atlassian.com/cloud/trello/power-ups/)
- [Trello Webhooks](https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/)
- [Trello Developer Community](https://community.developer.atlassian.com/c/trello/)