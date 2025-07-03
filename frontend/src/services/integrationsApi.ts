import axios from 'axios';
import { Integration, IntegrationStats, Provider, CalendarEvent, EmailMessage, SyncLog, OAuthCallbackData, ManualSyncData, GitHubRepository, GitHubRepositoryCreateData, GitHubBranch, GitHubCommit, GitHubCollaborator } from '../types/integrations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with auth token
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('access_token');
  return axios.create({
    baseURL: `${API_BASE_URL}/integrations`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

export const integrationsApi = {
  // Integration management
  getIntegrations: () => {
    const api = createAuthenticatedRequest();
    return api.get<Integration[]>('/');
  },

  getStats: () => {
    const api = createAuthenticatedRequest();
    return api.get<IntegrationStats>('/stats/');
  },

  getAvailableProviders: () => {
    const api = createAuthenticatedRequest();
    return api.get<Provider[]>('/providers/');
  },

  // OAuth flow
  initiateOAuth: (provider: string) => {
    const api = createAuthenticatedRequest();
    return api.post<{ oauth_url: string; state: string }>('/oauth/initiate/', { provider });
  },

  handleOAuthCallback: (data: OAuthCallbackData) => {
    const api = createAuthenticatedRequest();
    return api.post<{ integration: Integration; message: string }>('/oauth/callback/', data);
  },

  // Integration actions
  disconnectIntegration: (integrationId: number) => {
    const api = createAuthenticatedRequest();
    return api.delete<{ message: string }>(`/${integrationId}/disconnect/`);
  },

  deleteIntegration: (integrationId: number) => {
    const api = createAuthenticatedRequest();
    return api.delete<{ 
      message: string; 
      deleted_data: {
        provider: string;
        calendar_events: number;
        email_messages: number;
        sync_logs: number;
      }
    }>(`/${integrationId}/delete/`);
  },

  manualSync: (integrationId: number, syncType: ManualSyncData['sync_type']) => {
    const api = createAuthenticatedRequest();
    return api.post<{ message: string }>(`/${integrationId}/sync/`, { sync_type: syncType });
  },

  // Calendar events
  getCalendarEvents: (params?: {
    provider?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }) => {
    const api = createAuthenticatedRequest();
    return api.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: CalendarEvent[];
    }>('/events/', { params });
  },

  getCalendarEvent: (eventId: number) => {
    const api = createAuthenticatedRequest();
    return api.get<CalendarEvent>(`/events/${eventId}/`);
  },

  // Email messages
  getEmailMessages: (params?: {
    provider?: string;
    is_read?: boolean;
    is_important?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
  }) => {
    const api = createAuthenticatedRequest();
    return api.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: EmailMessage[];
    }>('/emails/', { params });
  },

  getEmailMessage: (messageId: number) => {
    const api = createAuthenticatedRequest();
    return api.get<EmailMessage>(`/emails/${messageId}/`);
  },

  // Sync logs
  getSyncLogs: (params?: {
    integration?: number;
    sync_type?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) => {
    const api = createAuthenticatedRequest();
    return api.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: SyncLog[];
    }>('/sync-logs/', { params });
  },

  // GitHub Repositories
  getGitHubRepositories: (params?: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    type?: 'all' | 'owner' | 'public' | 'private' | 'member';
    per_page?: number;
    page?: number;
  }) => {
    const api = createAuthenticatedRequest();
    return api.get<{ repositories: GitHubRepository[]; count: number }>('/github/repositories/', { params });
  },

  createGitHubRepository: (data: GitHubRepositoryCreateData) => {
    const api = createAuthenticatedRequest();
    return api.post<GitHubRepository>('/github/repositories/create/', data);
  },

  getGitHubRepository: (owner: string, repo: string) => {
    const api = createAuthenticatedRequest();
    return api.get<GitHubRepository>(`/github/repositories/${owner}/${repo}/`);
  },

  updateGitHubRepository: (owner: string, repo: string, data: Partial<GitHubRepositoryCreateData>) => {
    const api = createAuthenticatedRequest();
    return api.patch<GitHubRepository>(`/github/repositories/${owner}/${repo}/update/`, data);
  },

  deleteGitHubRepository: (owner: string, repo: string) => {
    const api = createAuthenticatedRequest();
    return api.delete<{ message: string }>(`/github/repositories/${owner}/${repo}/delete/`);
  },

  getGitHubRepositoryCollaborators: (owner: string, repo: string) => {
    const api = createAuthenticatedRequest();
    return api.get<GitHubCollaborator[]>(`/github/repositories/${owner}/${repo}/collaborators/`);
  },

  addGitHubRepositoryCollaborator: (owner: string, repo: string, username: string, permission?: string) => {
    const api = createAuthenticatedRequest();
    return api.put<{ message: string }>(`/github/repositories/${owner}/${repo}/collaborators/${username}/`, { permission });
  },

  getGitHubRepositoryBranches: (owner: string, repo: string) => {
    const api = createAuthenticatedRequest();
    return api.get<GitHubBranch[]>(`/github/repositories/${owner}/${repo}/branches/`);
  },

  getGitHubRepositoryCommits: (owner: string, repo: string, params?: {
    sha?: string;
    path?: string;
    author?: string;
    since?: string;
    until?: string;
    per_page?: number;
    page?: number;
  }) => {
    const api = createAuthenticatedRequest();
    return api.get<GitHubCommit[]>(`/github/repositories/${owner}/${repo}/commits/`, { params });
  },

  getGitHubRepositoryContents: (owner: string, repo: string, path?: string) => {
    const api = createAuthenticatedRequest();
    return api.get<any>(`/github/repositories/${owner}/${repo}/contents/`, { params: { path } });
  },
};