export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR', status: number = 401) {
    super(message, code, status);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', status: number = 400) {
    super(message, code, status);
    this.name = 'ValidationError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, code: string = 'API_ERROR', status: number = 500) {
    super(message, code, status);
    this.name = 'ApiError';
  }
} 