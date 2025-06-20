# Notion Integration Setup

This guide covers setting up Notion integrations for databases, pages, blocks, and content management in your application.

## Prerequisites

- Notion account (personal or workspace)
- Basic understanding of Notion's structure (pages, databases, blocks)
- Understanding of OAuth 2.0 for public integrations
- HTTPS endpoint for webhooks (coming soon)

## 1. Create Notion Integration

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click **+ New integration**
3. Configure basic information:
   - **Name**: `Integrato`
   - **Logo**: Upload your app logo
   - **Associated workspace**: Select your workspace
   - **Type**: 
     - **Internal**: For your workspace only
     - **Public**: For distribution to other workspaces

## 2. Configure Integration Settings

### Capabilities
Select the capabilities your integration needs:

#### Content Capabilities
```
✓ Read content
✓ Update content  
✓ Insert content
```

#### Comment Capabilities
```
✓ Read comments
✓ Insert comments
```

#### User Capabilities
```
✓ Read user information including email addresses
```

### User Information
- **Read user information**: Enable if you need user details
- **Request email addresses**: Enable if you need user emails

## 3. Get Integration Credentials

### Internal Integration
1. After creating the integration, copy the **Internal Integration Token**
2. Format: `secret_...` (keep this secure)

### Public Integration (OAuth)
1. **OAuth client ID**: For public distribution
2. **OAuth client secret**: Keep secure
3. **Redirect URLs**: Add your callback URLs
```
http://localhost:3000/auth/notion/callback
https://yourdomain.com/auth/notion/callback
```

## 4. Share Pages/Databases with Integration

### For Internal Integrations
1. Open the Notion page or database you want to access
2. Click **Share** in the top right
3. Click **Invite** and search for your integration name
4. Select your integration and click **Invite**

### For Public Integrations
Users will grant access during the OAuth flow.

## 5. Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
# Notion Integration (Internal)
NOTION_INTEGRATION_TOKEN=secret_your_integration_token_here

# Notion OAuth (Public Integration)
NOTION_CLIENT_ID=your_oauth_client_id_here
NOTION_CLIENT_SECRET=your_oauth_client_secret_here
NOTION_REDIRECT_URI=http://localhost:8000/auth/notion/callback/

# Notion API
NOTION_API_BASE_URL=https://api.notion.com/v1
NOTION_VERSION=2022-06-28
```

### Frontend (.env)
```env
# Notion OAuth
VITE_NOTION_CLIENT_ID=your_oauth_client_id_here
VITE_NOTION_OAUTH_URL=https://api.notion.com/v1/oauth/authorize
```

## 6. Notion API Endpoints

### Authentication (Public Integration)
```
# OAuth authorization
GET https://api.notion.com/v1/oauth/authorize

# Exchange code for token
POST https://api.notion.com/v1/oauth/token
```

### Users
```
# Get current user
GET /users/me

# List users
GET /users

# Get user
GET /users/{user_id}
```

### Pages
```
# Get page
GET /pages/{page_id}

# Create page
POST /pages

# Update page properties
PATCH /pages/{page_id}

# Archive page
PATCH /pages/{page_id}
```

### Blocks
```
# Get block children
GET /blocks/{block_id}/children

# Append block children
PATCH /blocks/{block_id}/children

# Update block
PATCH /blocks/{block_id}

# Delete block
DELETE /blocks/{block_id}
```

### Databases
```
# Get database
GET /databases/{database_id}

# Query database
POST /databases/{database_id}/query

# Create database
POST /databases

# Update database
PATCH /databases/{database_id}
```

### Search
```
# Search
POST /search
```

## 7. Working with Databases

### Database Query Example
```json
{
  "filter": {
    "and": [
      {
        "property": "Status",
        "select": {
          "equals": "In Progress"
        }
      },
      {
        "property": "Priority",
        "select": {
          "equals": "High"
        }
      }
    ]
  },
  "sorts": [
    {
      "property": "Created",
      "direction": "descending"
    }
  ],
  "page_size": 50
}
```

### Create Database Page
```json
{
  "parent": {
    "database_id": "database_id_here"
  },
  "properties": {
    "Title": {
      "title": [
        {
          "text": {
            "content": "New Task"
          }
        }
      ]
    },
    "Status": {
      "select": {
        "name": "To Do"
      }
    },
    "Priority": {
      "select": {
        "name": "Medium"
      }
    },
    "Due Date": {
      "date": {
        "start": "2024-01-01"
      }
    }
  },
  "children": [
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Task description goes here."
            }
          }
        ]
      }
    }
  ]
}
```

## 8. Working with Blocks

### Common Block Types

#### Paragraph Block
```json
{
  "type": "paragraph",
  "paragraph": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a paragraph.",
          "link": null
        },
        "annotations": {
          "bold": false,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "default"
        }
      }
    ]
  }
}
```

#### Heading Blocks
```json
{
  "type": "heading_1",
  "heading_1": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Main Heading"
        }
      }
    ]
  }
}
```

#### To-Do Block
```json
{
  "type": "to_do",
  "to_do": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Complete this task"
        }
      }
    ],
    "checked": false
  }
}
```

#### Code Block
```json
{
  "type": "code",
  "code": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "console.log('Hello, World!');"
        }
      }
    ],
    "language": "javascript"
  }
}
```

#### Embed Block
```json
{
  "type": "embed",
  "embed": {
    "url": "https://www.youtube.com/watch?v=example"
  }
}
```

## 9. Property Types

### Database Property Types

#### Title
```json
{
  "Title": {
    "title": [
      {
        "text": {
          "content": "Page Title"
        }
      }
    ]
  }
}
```

#### Rich Text
```json
{
  "Description": {
    "rich_text": [
      {
        "text": {
          "content": "Detailed description"
        }
      }
    ]
  }
}
```

#### Number
```json
{
  "Price": {
    "number": 29.99
  }
}
```

#### Select
```json
{
  "Status": {
    "select": {
      "name": "In Progress"
    }
  }
}
```

#### Multi-select
```json
{
  "Tags": {
    "multi_select": [
      {
        "name": "urgent"
      },
      {
        "name": "work"
      }
    ]
  }
}
```

#### Date
```json
{
  "Due Date": {
    "date": {
      "start": "2024-01-01",
      "end": "2024-01-02"
    }
  }
}
```

#### Checkbox
```json
{
  "Completed": {
    "checkbox": true
  }
}
```

#### URL
```json
{
  "Website": {
    "url": "https://example.com"
  }
}
```

#### Email
```json
{
  "Contact": {
    "email": "user@example.com"
  }
}
```

#### Phone
```json
{
  "Phone": {
    "phone_number": "+1-555-123-4567"
  }
}
```

#### Relation
```json
{
  "Related Pages": {
    "relation": [
      {
        "id": "page_id_here"
      }
    ]
  }
}
```

## 10. Rate Limits

### Notion API Rate Limits
- **Rate limit**: 3 requests per second per integration
- **Burst limit**: Up to 10 requests in a short burst
- **Daily limit**: No explicit daily limit

### Rate Limit Headers
```
retry-after: 1000  # milliseconds to wait
```

### Best Practices
1. Implement exponential backoff
2. Respect retry-after headers
3. Use pagination for large datasets
4. Cache responses when appropriate

## 11. Error Handling

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
502: Bad Gateway
503: Service Unavailable
504: Gateway Timeout
```

### Error Response Format
```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "The provided page ID is not a valid UUID.",
  "details": {
    "property": "page_id",
    "error": "invalid_uuid"
  }
}
```

## 12. Pagination

### Paginated Response
```json
{
  "object": "list",
  "results": [
    // ... page objects
  ],
  "next_cursor": "cursor_string_here",
  "has_more": true,
  "type": "page",
  "page": {}
}
```

### Request with Cursor
```json
{
  "start_cursor": "cursor_string_here",
  "page_size": 50
}
```

## 13. Search Functionality

### Search Request
```json
{
  "query": "search term",
  "filter": {
    "value": "page",
    "property": "object"
  },
  "sort": {
    "direction": "ascending",
    "timestamp": "last_edited_time"
  },
  "page_size": 50
}
```

### Search Filters
```json
{
  "filter": {
    "or": [
      {
        "property": "object",
        "value": "page"
      },
      {
        "property": "object",
        "value": "database"
      }
    ]
  }
}
```

## 14. Security Best Practices

### Token Security
1. **Store tokens securely** (encrypted)
2. **Use environment variables** for secrets
3. **Implement token rotation** for public integrations
4. **Monitor token usage**

### API Security
1. **Validate all inputs**
2. **Implement proper error handling**
3. **Use HTTPS for all requests**
4. **Log API usage for monitoring**

### Access Control
1. **Request minimal permissions**
2. **Validate page/database access**
3. **Implement user authorization**
4. **Audit access patterns**

## 15. Testing and Development

### Testing Tools
1. **Postman**: Test API endpoints
2. **Notion API Explorer**: Interactive API testing
3. **Local development**: Use ngrok for webhooks (when available)

### Development Tips
1. **Start with internal integration** for testing
2. **Use small test databases** initially
3. **Test all property types** you plan to use
4. **Implement proper error handling** early

## 16. Common Use Cases

### Content Management
- Create and update pages
- Manage blog posts
- Sync documentation
- Content publishing workflows

### Project Management
- Task tracking
- Project databases
- Team collaboration
- Progress reporting

### Knowledge Base
- Documentation systems
- FAQ management
- Internal wikis
- Resource libraries

### CRM Integration
- Contact management
- Deal tracking
- Customer data sync
- Sales reporting

## 17. Sample Code Structure

### Backend Service Class
```python
class NotionService:
    def __init__(self, integration_token):
        self.token = integration_token
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
    
    def get_database(self, database_id):
        # Implementation
        pass
    
    def query_database(self, database_id, filter_obj=None, sorts=None):
        # Implementation
        pass
    
    def create_page(self, parent, properties, children=None):
        # Implementation
        pass
    
    def update_page(self, page_id, properties):
        # Implementation
        pass
    
    def get_page_content(self, page_id):
        # Implementation
        pass
    
    def append_blocks(self, block_id, children):
        # Implementation
        pass
```

### Frontend Integration
```javascript
// OAuth flow for public integration
const authorizeNotion = () => {
  const clientId = process.env.VITE_NOTION_CLIENT_ID;
  const redirectUri = encodeURIComponent('http://localhost:3000/auth/notion/callback');
  const state = generateRandomState();
  
  const authUrl = `https://api.notion.com/v1/oauth/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `owner=user&` +
    `redirect_uri=${redirectUri}&` +
    `state=${state}`;
  
  window.location.href = authUrl;
};
```

## 18. Monitoring and Analytics

### Usage Metrics
1. **API call frequency**
2. **Database query patterns**
3. **Page creation/update rates**
4. **User engagement**

### Performance Monitoring
1. **Response times**
2. **Error rates**
3. **Rate limit hits**
4. **Token refresh frequency**

## 19. Common Issues and Solutions

### "object_not_found" Error
- Verify page/database ID format
- Check integration permissions
- Ensure page/database is shared with integration

### "validation_error" Error
- Check property types and formats
- Validate required fields
- Ensure proper JSON structure

### Rate Limiting
- Implement exponential backoff
- Respect retry-after headers
- Consider request batching

### Permission Issues
- Verify integration capabilities
- Check page/database sharing
- Ensure proper OAuth scopes

## 20. Next Steps

1. Set up integration and test basic API calls
2. Implement database querying and page creation
3. Build content synchronization features
4. Add block manipulation capabilities
5. Implement search functionality
6. Set up proper error handling and logging
7. Test with various content types and structures
8. Prepare for public distribution (if applicable)

## Useful Links

- [Notion API Documentation](https://developers.notion.com/)
- [Notion API Reference](https://developers.notion.com/reference)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [Notion SDK for Python](https://github.com/ramnes/notion-sdk-py)
- [Notion Developers Community](https://developers.notion.com/community)