export interface Integration {
  id: number;
  provider: string;
  provider_user_id: string;
  provider_email: string;
  status: 'connected' | 'disconnected' | 'error';
  sync_enabled: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationStats {
  total_integrations: number;
  connected_integrations: number;
  total_events: number;
  total_emails: number;
  last_sync: string | null;
  providers: Record<string, {
    count: number;
    connected: number;
  }>;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'calendar' | 'email';
  available: boolean;
}

export interface CalendarEvent {
  id: number;
  integration: number;
  provider_event_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  attendees: string[];
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: number;
  integration: number;
  provider_message_id: string;
  subject: string;
  sender: string;
  recipients: string[];
  body_preview: string;
  is_read: boolean;
  is_important: boolean;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: number;
  integration: number;
  sync_type: 'calendar' | 'email' | 'full';
  status: 'pending' | 'running' | 'completed' | 'failed';
  items_synced: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface OAuthCallbackData {
  code: string;
  provider: string;
  state?: string;
}

export interface ManualSyncData {
  sync_type: 'calendar' | 'email' | 'full';
}