
export interface NodeInfo {
  id: string;
  ip?: string;
  hostname?: string;
  status?: string;
  [key: string]: any;
}

export interface NodeMetrics {
  system: {
    cpu: {
      usage: number;
      cores: number;
      load: number[];
    };
    memory: {
      total: number;
      used: number;
      free: number;
      swap: {
        total: number;
        used: number;
        free: number;
      };
    };
    disk: {
      total: number;
      used: number;
      free: number;
    };
    network: {
      interfaces: Record<string, {
        bytesReceived: number;
        bytesSent: number;
      }>;
    };
  };
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  cache: {
    hits: number;
    misses: number;
    errors: number;
    size: number;
  };
  api: {
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
}
