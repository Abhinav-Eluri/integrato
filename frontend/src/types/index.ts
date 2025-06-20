// Export all types from separate files
export * from './ui';
export * from './auth';
export * from './api';

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
}

// Generic types
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}