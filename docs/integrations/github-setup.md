# GitHub Integration Setup

This guide covers setting up GitHub integrations for repositories, issues, pull requests, projects, and development workflow automation in your application.

## Prerequisites

- GitHub account (personal or organization)
- Basic understanding of Git and GitHub workflows
- Understanding of OAuth 2.0 for authentication
- HTTPS endpoint for webhooks
- GitHub App or OAuth App registration

## 1. Choose Integration Type

### GitHub App (Recommended)
- **Best for**: Organizations, fine-grained permissions, webhooks
- **Benefits**: Better security, installation-based, rate limits per installation
- **Use case**: Production applications, organization-wide integrations

### OAuth App
- **Best for**: Personal use, simpler setup
- **Benefits**: Easier to set up, user-based authentication
- **Use case**: Personal projects, user-centric applications

### Personal Access Token
- **Best for**: Development, testing, server-to-server
- **Benefits**: Simple authentication, no OAuth flow
- **Use case**: Development, automation scripts, testing

## 2. Create GitHub App (Recommended)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New GitHub App**
3. Fill in the basic information:
   - **GitHub App name**: `Integrato`
   - **Description**: `Integration platform for productivity tools`
   - **Homepage URL**: `https://yourdomain.com`
   - **Callback URL**: `https://yourdomain.com/auth/github/callback`
   - **Webhook URL**: `https://yourdomain.com/webhooks/github/`
   - **Webhook secret**: Generate a secure secret

### App Permissions

#### Repository Permissions
```
✓ Actions: Read (for workflow status)
✓ Administration: Read (for repo settings)
✓ Checks: Write (for status checks)
✓ Contents: Write (for file operations)
✓ Issues: Write (for issue management)
✓ Metadata: Read (required)
✓ Pull requests: Write (for PR management)
✓ Projects: Write (for project boards)
✓ Repository hooks: Write (for webhooks)
✓ Statuses: Write (for commit statuses)
```

#### Organization Permissions
```
✓ Members: Read (for team info)
✓ Projects: Write (for org projects)
```

#### Account Permissions
```
✓ Email addresses: Read (for user info)
✓ Profile: Read (for user info)
```

### Subscribe to Events
```
✓ Issues
✓ Issue comments
✓ Pull requests
✓ Pull request reviews
✓ Pull request review comments
✓ Push
✓ Repository
✓ Release
✓ Project
✓ Project card
✓ Project column
✓ Check run
✓ Check suite
✓ Status
✓ Workflow run
```

## 3. Create OAuth App (Alternative)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the information:
   - **Application name**: `Integrato`
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/auth/github/callback`

### OAuth Scopes
```
repo              # Full repository access
repo:status       # Commit status access
repo_deployment   # Deployment status access
public_repo       # Public repository access
repo:invite       # Repository invitation access
security_events   # Security events access
user              # User profile access
user:email        # User email access
read:org          # Organization read access
write:org         # Organization write access
read:public_key   # Public key read access
write:public_key  # Public key write access
read:repo_hook    # Repository hook read access
write:repo_hook   # Repository hook write access
read:org_hook     # Organization hook read access
write:org_hook    # Organization hook write access
read:user         # User read access
user:follow       # User follow access
project           # Project access
read:project      # Project read access
write:project     # Project write access
```

## 4. Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
# GitHub App Credentials
GITHUB_APP_ID=your_app_id_here
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
GITHUB_APP_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_APP_CLIENT_ID=your_client_id_here
GITHUB_APP_CLIENT_SECRET=your_client_secret_here

# GitHub OAuth (if using OAuth App)
GITHUB_OAUTH_CLIENT_ID=your_oauth_client_id_here
GITHUB_OAUTH_CLIENT_SECRET=your_oauth_client_secret_here

# GitHub API
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_WEBHOOK_CALLBACK_URL=https://yourdomain.com/webhooks/github/

# Personal Access Token (for development)
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

### Frontend (.env)
```env
# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_GITHUB_OAUTH_URL=https://github.com/login/oauth/authorize
```

## 5. GitHub API Endpoints

### Authentication
```
# OAuth authorization
GET https://github.com/login/oauth/authorize

# Exchange code for token
POST https://github.com/login/oauth/access_token

# Get authenticated user
GET /user
```

### Repositories
```
# List user repositories
GET /user/repos

# List organization repositories
GET /orgs/{org}/repos

# Get repository
GET /repos/{owner}/{repo}

# Create repository
POST /user/repos

# Update repository
PATCH /repos/{owner}/{repo}

# Delete repository
DELETE /repos/{owner}/{repo}

# List repository collaborators
GET /repos/{owner}/{repo}/collaborators

# Add collaborator
PUT /repos/{owner}/{repo}/collaborators/{username}
```

### Issues
```
# List repository issues
GET /repos/{owner}/{repo}/issues

# Get issue
GET /repos/{owner}/{repo}/issues/{issue_number}

# Create issue
POST /repos/{owner}/{repo}/issues

# Update issue
PATCH /repos/{owner}/{repo}/issues/{issue_number}

# List issue comments
GET /repos/{owner}/{repo}/issues/{issue_number}/comments

# Create issue comment
POST /repos/{owner}/{repo}/issues/{issue_number}/comments

# List issue labels
GET /repos/{owner}/{repo}/issues/{issue_number}/labels

# Add labels to issue
POST /repos/{owner}/{repo}/issues/{issue_number}/labels

# Assign users to issue
POST /repos/{owner}/{repo}/issues/{issue_number}/assignees
```

### Pull Requests
```
# List pull requests
GET /repos/{owner}/{repo}/pulls

# Get pull request
GET /repos/{owner}/{repo}/pulls/{pull_number}

# Create pull request
POST /repos/{owner}/{repo}/pulls

# Update pull request
PATCH /repos/{owner}/{repo}/pulls/{pull_number}

# Merge pull request
PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge

# List PR reviews
GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews

# Create PR review
POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews

# List PR files
GET /repos/{owner}/{repo}/pulls/{pull_number}/files

# List PR comments
GET /repos/{owner}/{repo}/pulls/{pull_number}/comments
```

### Branches
```
# List branches
GET /repos/{owner}/{repo}/branches

# Get branch
GET /repos/{owner}/{repo}/branches/{branch}

# Create branch
POST /repos/{owner}/{repo}/git/refs

# Delete branch
DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}

# Get branch protection
GET /repos/{owner}/{repo}/branches/{branch}/protection

# Update branch protection
PUT /repos/{owner}/{repo}/branches/{branch}/protection
```

### Commits
```
# List commits
GET /repos/{owner}/{repo}/commits

# Get commit
GET /repos/{owner}/{repo}/commits/{sha}

# Compare commits
GET /repos/{owner}/{repo}/compare/{base}...{head}

# Create commit status
POST /repos/{owner}/{repo}/statuses/{sha}

# List commit statuses
GET /repos/{owner}/{repo}/commits/{sha}/statuses
```

### Contents
```
# Get repository content
GET /repos/{owner}/{repo}/contents/{path}

# Create file
PUT /repos/{owner}/{repo}/contents/{path}

# Update file
PUT /repos/{owner}/{repo}/contents/{path}

# Delete file
DELETE /repos/{owner}/{repo}/contents/{path}

# Get repository archive
GET /repos/{owner}/{repo}/zipball/{ref}
GET /repos/{owner}/{repo}/tarball/{ref}
```

### Projects
```
# List repository projects
GET /repos/{owner}/{repo}/projects

# List organization projects
GET /orgs/{org}/projects

# Get project
GET /projects/{project_id}

# Create project
POST /repos/{owner}/{repo}/projects

# Update project
PATCH /projects/{project_id}

# List project columns
GET /projects/{project_id}/columns

# Create project column
POST /projects/{project_id}/columns

# List column cards
GET /projects/columns/{column_id}/cards

# Create project card
POST /projects/columns/{column_id}/cards
```

### Actions
```
# List workflow runs
GET /repos/{owner}/{repo}/actions/runs

# Get workflow run
GET /repos/{owner}/{repo}/actions/runs/{run_id}

# List workflows
GET /repos/{owner}/{repo}/actions/workflows

# Trigger workflow
POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches

# List artifacts
GET /repos/{owner}/{repo}/actions/artifacts

# Download artifact
GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/zip
```

### Releases
```
# List releases
GET /repos/{owner}/{repo}/releases

# Get release
GET /repos/{owner}/{repo}/releases/{release_id}

# Create release
POST /repos/{owner}/{repo}/releases

# Update release
PATCH /repos/{owner}/{repo}/releases/{release_id}

# Delete release
DELETE /repos/{owner}/{repo}/releases/{release_id}

# List release assets
GET /repos/{owner}/{repo}/releases/{release_id}/assets

# Upload release asset
POST /repos/{owner}/{repo}/releases/{release_id}/assets
```

## 6. Working with Issues

### Create Issue
```json
{
  "title": "Bug: Application crashes on startup",
  "body": "## Description\n\nThe application crashes when starting up on Windows 10.\n\n## Steps to Reproduce\n\n1. Launch the application\n2. Wait for startup\n3. Application crashes\n\n## Expected Behavior\n\nApplication should start normally.\n\n## Environment\n\n- OS: Windows 10\n- Version: 1.0.0",
  "labels": ["bug", "priority:high"],
  "assignees": ["username1", "username2"],
  "milestone": 1
}
```

### Update Issue
```json
{
  "title": "Updated issue title",
  "body": "Updated issue description",
  "state": "closed",
  "labels": ["bug", "fixed"],
  "assignees": ["username1"]
}
```

### Issue Search Parameters
```
# Search issues
GET /search/issues?q=repo:owner/repo+is:issue+is:open+label:bug

# Query parameters
is:issue, is:pr, is:open, is:closed
label:bug, label:"help wanted"
author:username, assignee:username
milestone:"v1.0", milestone:none
sort:created, sort:updated, sort:comments
order:asc, order:desc
```

## 7. Working with Pull Requests

### Create Pull Request
```json
{
  "title": "Add new feature",
  "body": "## Changes\n\n- Added new feature X\n- Fixed bug Y\n- Updated documentation\n\n## Testing\n\n- [ ] Unit tests pass\n- [ ] Integration tests pass\n- [ ] Manual testing completed",
  "head": "feature-branch",
  "base": "main",
  "draft": false,
  "maintainer_can_modify": true
}
```

### Update Pull Request
```json
{
  "title": "Updated PR title",
  "body": "Updated PR description",
  "state": "closed",
  "base": "develop"
}
```

### Merge Pull Request
```json
{
  "commit_title": "Merge pull request #123",
  "commit_message": "Add new feature\n\nThis PR adds feature X with the following changes:\n- Implementation of feature X\n- Tests for feature X\n- Documentation updates",
  "merge_method": "merge"  // merge, squash, rebase
}
```

### Create PR Review
```json
{
  "body": "Overall looks good! Just a few minor suggestions.",
  "event": "APPROVE",  // APPROVE, REQUEST_CHANGES, COMMENT
  "comments": [
    {
      "path": "src/main.js",
      "line": 42,
      "body": "Consider using const instead of let here."
    }
  ]
}
```

## 8. Working with Projects

### Create Project
```json
{
  "name": "Feature Development",
  "body": "Project for tracking feature development progress",
  "state": "open"
}
```

### Create Project Column
```json
{
  "name": "To Do"
}
```

### Create Project Card
```json
{
  "note": "Implement user authentication"
}
```

### Create Card from Issue
```json
{
  "content_id": 123,
  "content_type": "Issue"
}
```

### Move Project Card
```json
{
  "position": "top",
  "column_id": 456
}
```

## 9. Working with Files

### Get File Content
```
GET /repos/{owner}/{repo}/contents/{path}
```

### Create File
```json
{
  "message": "Create new configuration file",
  "content": "base64_encoded_content_here",
  "branch": "main",
  "committer": {
    "name": "Committer Name",
    "email": "committer@example.com"
  },
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  }
}
```

### Update File
```json
{
  "message": "Update configuration file",
  "content": "base64_encoded_updated_content_here",
  "sha": "file_sha_here",
  "branch": "main"
}
```

### Delete File
```json
{
  "message": "Remove obsolete file",
  "sha": "file_sha_here",
  "branch": "main"
}
```

## 10. Webhooks

### Create Repository Webhook
```json
{
  "name": "web",
  "active": true,
  "events": [
    "push",
    "pull_request",
    "issues",
    "issue_comment",
    "pull_request_review",
    "release",
    "workflow_run"
  ],
  "config": {
    "url": "https://yourdomain.com/webhooks/github/",
    "content_type": "json",
    "secret": "your_webhook_secret_here",
    "insecure_ssl": "0"
  }
}
```

### Webhook Events

#### Push Event
```json
{
  "ref": "refs/heads/main",
  "before": "previous_commit_sha",
  "after": "new_commit_sha",
  "repository": {
    "id": 123456,
    "name": "repo-name",
    "full_name": "owner/repo-name"
  },
  "commits": [
    {
      "id": "commit_sha",
      "message": "Commit message",
      "author": {
        "name": "Author Name",
        "email": "author@example.com"
      },
      "added": ["file1.js"],
      "removed": ["file2.js"],
      "modified": ["file3.js"]
    }
  ],
  "head_commit": {
    "id": "commit_sha",
    "message": "Latest commit message"
  },
  "pusher": {
    "name": "pusher-username",
    "email": "pusher@example.com"
  }
}
```

#### Issues Event
```json
{
  "action": "opened",  // opened, closed, reopened, edited, assigned, etc.
  "issue": {
    "id": 123456,
    "number": 42,
    "title": "Issue title",
    "body": "Issue description",
    "state": "open",
    "labels": [
      {
        "name": "bug",
        "color": "d73a4a"
      }
    ],
    "assignees": [
      {
        "login": "username",
        "id": 789
      }
    ],
    "user": {
      "login": "issue-creator",
      "id": 456
    }
  },
  "repository": {
    "id": 123456,
    "name": "repo-name",
    "full_name": "owner/repo-name"
  },
  "sender": {
    "login": "event-sender",
    "id": 789
  }
}
```

#### Pull Request Event
```json
{
  "action": "opened",  // opened, closed, reopened, edited, synchronize, etc.
  "pull_request": {
    "id": 123456,
    "number": 42,
    "title": "PR title",
    "body": "PR description",
    "state": "open",
    "draft": false,
    "merged": false,
    "mergeable": true,
    "head": {
      "ref": "feature-branch",
      "sha": "commit_sha",
      "repo": {
        "name": "repo-name",
        "full_name": "owner/repo-name"
      }
    },
    "base": {
      "ref": "main",
      "sha": "base_commit_sha",
      "repo": {
        "name": "repo-name",
        "full_name": "owner/repo-name"
      }
    },
    "user": {
      "login": "pr-creator",
      "id": 456
    },
    "assignees": [],
    "requested_reviewers": [
      {
        "login": "reviewer",
        "id": 789
      }
    ]
  }
}
```

### Webhook Security

#### Verify Webhook Signature
```python
import hmac
import hashlib

def verify_webhook_signature(payload_body, signature_header, secret):
    """Verify GitHub webhook signature"""
    signature = signature_header.split('=')[1]
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)
```

## 11. Rate Limits

### GitHub API Rate Limits

#### Authenticated Requests
- **REST API**: 5,000 requests per hour
- **GraphQL API**: 5,000 points per hour
- **Search API**: 30 requests per minute
- **GitHub Apps**: 15,000 requests per hour per installation

#### Unauthenticated Requests
- **REST API**: 60 requests per hour per IP
- **Search API**: 10 requests per minute per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1640995200
X-RateLimit-Used: 1
X-RateLimit-Resource: core
```

### Best Practices
1. **Monitor rate limit headers**
2. **Implement exponential backoff**
3. **Use conditional requests** (ETags)
4. **Cache responses** when appropriate
5. **Use GraphQL** for complex queries
6. **Prefer webhooks** over polling

## 12. Error Handling

### Common Error Codes
```
200: OK
201: Created
204: No Content
304: Not Modified
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
409: Conflict
422: Unprocessable Entity
429: Too Many Requests
500: Internal Server Error
502: Bad Gateway
503: Service Unavailable
```

### Error Response Format
```json
{
  "message": "Validation Failed",
  "errors": [
    {
      "resource": "Issue",
      "field": "title",
      "code": "missing_field"
    }
  ],
  "documentation_url": "https://docs.github.com/rest/reference/issues#create-an-issue"
}
```

### Common Error Scenarios
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Repository or resource doesn't exist
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded

## 13. Security Best Practices

### Token Security
1. **Store tokens securely** (encrypted, environment variables)
2. **Use minimal scopes** required for functionality
3. **Implement token rotation** for long-lived tokens
4. **Monitor token usage** for suspicious activity
5. **Revoke unused tokens** regularly

### Webhook Security
1. **Verify webhook signatures** using secret
2. **Use HTTPS endpoints** for webhooks
3. **Validate webhook payloads** before processing
4. **Implement idempotency** for webhook handlers
5. **Log webhook events** for monitoring

### API Security
1. **Validate all inputs** before API calls
2. **Implement proper error handling**
3. **Use HTTPS** for all requests
4. **Sanitize user inputs** in commit messages, issues, etc.
5. **Implement access controls** based on user permissions

## 14. Testing and Development

### Testing Tools
1. **GitHub CLI**: Command-line testing
2. **Postman**: API endpoint testing
3. **ngrok**: Local webhook testing
4. **GitHub API Explorer**: Interactive testing
5. **Webhook.site**: Webhook payload inspection

### Development Tips
1. **Start with personal access tokens** for testing
2. **Use test repositories** for development
3. **Test webhook handling** thoroughly
4. **Implement proper error handling** early
5. **Test rate limiting** scenarios
6. **Use GitHub's test suite** for validation

### Local Development Setup
```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Test API access
gh api user

# Create test repository
gh repo create test-integration --private

# Set up webhook forwarding
ngrok http 8000
```

## 15. Common Use Cases

### Development Workflow
- Automated issue creation from external systems
- Pull request automation and validation
- Code review assignment and notifications
- Release management and deployment

### Project Management
- Issue tracking and assignment
- Project board automation
- Sprint planning and reporting
- Team collaboration and communication

### CI/CD Integration
- Workflow trigger automation
- Build status reporting
- Deployment notifications
- Artifact management

### Documentation
- Automated documentation updates
- Wiki synchronization
- README generation
- API documentation publishing

## 16. Sample Code Structure

### Backend Service Class
```python
import requests
import jwt
import time
from datetime import datetime, timedelta

class GitHubService:
    def __init__(self, app_id=None, private_key=None, access_token=None):
        self.app_id = app_id
        self.private_key = private_key
        self.access_token = access_token
        self.base_url = "https://api.github.com"
    
    def _get_app_token(self):
        """Generate JWT for GitHub App authentication"""
        payload = {
            'iat': int(time.time()),
            'exp': int(time.time()) + 600,  # 10 minutes
            'iss': self.app_id
        }
        return jwt.encode(payload, self.private_key, algorithm='RS256')
    
    def _get_installation_token(self, installation_id):
        """Get installation access token"""
        app_token = self._get_app_token()
        headers = {
            'Authorization': f'Bearer {app_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        response = requests.post(
            f'{self.base_url}/app/installations/{installation_id}/access_tokens',
            headers=headers
        )
        return response.json()['token']
    
    def _make_request(self, method, endpoint, data=None, token=None):
        """Make authenticated request to GitHub API"""
        headers = {
            'Authorization': f'token {token or self.access_token}',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Integrato/1.0'
        }
        
        url = f'{self.base_url}{endpoint}'
        response = requests.request(method, url, headers=headers, json=data)
        
        if response.status_code == 429:
            # Handle rate limiting
            reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
            sleep_time = max(reset_time - int(time.time()), 0)
            time.sleep(sleep_time + 1)
            return self._make_request(method, endpoint, data, token)
        
        response.raise_for_status()
        return response.json() if response.content else None
    
    # Repository methods
    def get_repositories(self, user=None, org=None):
        if org:
            return self._make_request('GET', f'/orgs/{org}/repos')
        elif user:
            return self._make_request('GET', f'/users/{user}/repos')
        else:
            return self._make_request('GET', '/user/repos')
    
    def get_repository(self, owner, repo):
        return self._make_request('GET', f'/repos/{owner}/{repo}')
    
    def create_repository(self, name, description=None, private=True):
        data = {'name': name, 'private': private}
        if description:
            data['description'] = description
        return self._make_request('POST', '/user/repos', data)
    
    # Issue methods
    def get_issues(self, owner, repo, state='open', labels=None):
        params = {'state': state}
        if labels:
            params['labels'] = ','.join(labels)
        endpoint = f'/repos/{owner}/{repo}/issues'
        return self._make_request('GET', endpoint)
    
    def create_issue(self, owner, repo, title, body=None, labels=None, assignees=None):
        data = {'title': title}
        if body:
            data['body'] = body
        if labels:
            data['labels'] = labels
        if assignees:
            data['assignees'] = assignees
        return self._make_request('POST', f'/repos/{owner}/{repo}/issues', data)
    
    def update_issue(self, owner, repo, issue_number, **kwargs):
        return self._make_request('PATCH', f'/repos/{owner}/{repo}/issues/{issue_number}', kwargs)
    
    # Pull Request methods
    def get_pull_requests(self, owner, repo, state='open'):
        return self._make_request('GET', f'/repos/{owner}/{repo}/pulls?state={state}')
    
    def create_pull_request(self, owner, repo, title, head, base, body=None, draft=False):
        data = {
            'title': title,
            'head': head,
            'base': base,
            'draft': draft
        }
        if body:
            data['body'] = body
        return self._make_request('POST', f'/repos/{owner}/{repo}/pulls', data)
    
    def merge_pull_request(self, owner, repo, pull_number, commit_title=None, commit_message=None, merge_method='merge'):
        data = {'merge_method': merge_method}
        if commit_title:
            data['commit_title'] = commit_title
        if commit_message:
            data['commit_message'] = commit_message
        return self._make_request('PUT', f'/repos/{owner}/{repo}/pulls/{pull_number}/merge', data)
    
    # Webhook methods
    def create_webhook(self, owner, repo, url, secret, events=None):
        if events is None:
            events = ['push', 'pull_request', 'issues']
        
        data = {
            'name': 'web',
            'active': True,
            'events': events,
            'config': {
                'url': url,
                'content_type': 'json',
                'secret': secret,
                'insecure_ssl': '0'
            }
        }
        return self._make_request('POST', f'/repos/{owner}/{repo}/hooks', data)
```

### Frontend Integration
```javascript
// OAuth authorization
const authorizeGitHub = () => {
  const clientId = process.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent('http://localhost:3000/auth/github/callback');
  const scope = 'repo,user,read:org';
  const state = generateRandomState();
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scope}&` +
    `state=${state}`;
  
  window.location.href = authUrl;
};

// API client
class GitHubClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.github.com';
  }
  
  async makeRequest(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Authorization': `token ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };
    
    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (response.status === 429) {
      // Handle rate limiting
      const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
      const waitTime = (resetTime * 1000) - Date.now() + 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.makeRequest(method, endpoint, data);
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  getUser() {
    return this.makeRequest('GET', '/user');
  }
  
  getRepositories() {
    return this.makeRequest('GET', '/user/repos');
  }
  
  getIssues(owner, repo) {
    return this.makeRequest('GET', `/repos/${owner}/${repo}/issues`);
  }
  
  createIssue(owner, repo, title, body, labels = []) {
    return this.makeRequest('POST', `/repos/${owner}/${repo}/issues`, {
      title,
      body,
      labels,
    });
  }
  
  getPullRequests(owner, repo) {
    return this.makeRequest('GET', `/repos/${owner}/${repo}/pulls`);
  }
  
  createPullRequest(owner, repo, title, head, base, body) {
    return this.makeRequest('POST', `/repos/${owner}/${repo}/pulls`, {
      title,
      head,
      base,
      body,
    });
  }
}
```

## 17. Monitoring and Analytics

### Usage Metrics
1. **API call frequency and patterns**
2. **Repository and issue activity**
3. **Pull request creation and merge rates**
4. **Webhook event processing**
5. **User engagement patterns**

### Performance Monitoring
1. **Response times**
2. **Error rates and types**
3. **Rate limit utilization**
4. **Webhook delivery success rates**
5. **Token refresh frequency**

## 18. Next Steps

1. Set up GitHub App or OAuth App and test authentication
2. Implement repository and issue management features
3. Build pull request automation and review workflows
4. Set up webhook handling for real-time updates
5. Add project board integration and automation
6. Implement file content management features
7. Add search and filtering capabilities
8. Set up proper error handling and rate limiting
9. Test with various repository configurations
10. Prepare for production deployment with proper security

## Useful Links

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [GitHub CLI](https://cli.github.com/)
- [GitHub Developer Community](https://github.community/)
- [Octokit SDKs](https://github.com/octokit)