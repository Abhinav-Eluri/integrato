// API Response types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SearchParams {
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar?: string;
}