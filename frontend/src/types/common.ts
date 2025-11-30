export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  code: number;
  message: string;
  details?: string;
  timestamp: string;
}

export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  details?: string;
  fieldErrors?: FieldError[];
  path: string;
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
}

export type SortDirection = 'ASC' | 'DESC';

export interface PageRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
