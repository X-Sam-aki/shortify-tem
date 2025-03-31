declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
  }

  export type Handler = (request: Request) => Response | Promise<Response>;

  export function serve(
    handler: Handler,
    init?: Partial<ServeInit>
  ): Promise<void>;
  
  export function serve(
    init: ServeInit
  ): Promise<void>;
} 