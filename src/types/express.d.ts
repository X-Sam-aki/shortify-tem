
// This is a minimal mock of express types for client-side code
declare module 'express' {
  export interface Request {
    headers: Record<string, string | string[] | undefined>;
    ip?: string;
    body: any;
    query: any;
    params: any;
    path: string;
    method: string;
    user?: {
      id: string;
      permissions?: string[];
    };
  }

  export interface Response {
    setHeader(name: string, value: string): void;
    status(code: number): Response;
    json(body: any): void;
    sendStatus(code: number): void;
    on(event: string, listener: Function): void;
    statusCode: number;
  }

  export type NextFunction = (error?: any) => void;
}

// Type definition for the ApiKey interface used in securityMiddleware
declare interface ApiKey {
  key: string;
  name: string;
  userId: string;
  permissions: string[];
  createdAt: Date;
  lastUsed: Date;
  expiresAt: Date;
  isActive: boolean;
}
