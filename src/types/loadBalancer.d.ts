
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

// Add these interfaces for the LoadBalancerService implementation
export interface ClusterNode {
  info: NodeInfo;
  metrics?: NodeMetrics;
  lastSeen?: Date;
}

export interface ILoadBalancerService {
  addNode(nodeInfo: NodeInfo): Promise<void>;
  updateNodeMetrics(nodeId: string, metrics: NodeMetrics): Promise<void>;
  removeNode(nodeId: string): Promise<void>;
  getNode(nodeId: string): ClusterNode | undefined;
  getNodes(): ClusterNode[];
}

// Add a partial metrics type for testing
export interface PartialNodeMetrics {
  system: {
    cpu: {
      usage: number;
      cores: number;
      load: number[];
    };
    memory: {
      used: number;
      total: number;
      free: number;
      swap: {
        total: number;
        used: number;
        free: number;
      };
    };
  };
  queue: {
    waiting: number;
  };
}
