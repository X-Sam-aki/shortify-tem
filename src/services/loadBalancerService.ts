
import { NodeInfo, NodeMetrics, ClusterNode, ILoadBalancerService, PartialNodeMetrics } from '@/types/loadBalancer';
import { QueueService } from './queueService';
import { PerformanceService } from './performanceService';
import { logger } from '@/utils/logger';

export class LoadBalancerService implements ILoadBalancerService {
  private static instance: LoadBalancerService;
  private nodes: Map<string, ClusterNode>;
  private queueService: QueueService;
  private performanceService: PerformanceService;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.nodes = new Map<string, ClusterNode>();
    this.queueService = QueueService.getInstance();
    this.performanceService = PerformanceService.getInstance();
  }
  
  public static getInstance(): LoadBalancerService {
    if (!LoadBalancerService.instance) {
      LoadBalancerService.instance = new LoadBalancerService();
    }
    return LoadBalancerService.instance;
  }
  
  public async addNode(nodeInfo: NodeInfo): Promise<void> {
    const node: ClusterNode = {
      info: nodeInfo,
      lastSeen: new Date()
    };
    
    this.nodes.set(nodeInfo.id, node);
    logger.info(`Node ${nodeInfo.id} added to cluster`);
  }
  
  public async updateNodeMetrics(nodeId: string, metrics: NodeMetrics): Promise<void> {
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    
    node.metrics = metrics;
    node.lastSeen = new Date();
    
    logger.debug(`Updated metrics for node ${nodeId}`);
  }
  
  public async removeNode(nodeId: string): Promise<void> {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} not found`);
    }
    
    this.nodes.delete(nodeId);
    logger.info(`Node ${nodeId} removed from cluster`);
  }
  
  public getNode(nodeId: string): ClusterNode | undefined {
    return this.nodes.get(nodeId);
  }
  
  public getNodes(): ClusterNode[] {
    return Array.from(this.nodes.values());
  }
  
  public startHealthCheck(interval: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      const now = new Date();
      const staleTimeout = 60000; // 1 minute
      
      for (const [nodeId, node] of this.nodes.entries()) {
        if (node.lastSeen && (now.getTime() - node.lastSeen.getTime() > staleTimeout)) {
          logger.warn(`Node ${nodeId} has not reported for more than ${staleTimeout / 1000} seconds, marking as offline`);
          node.info.status = 'offline';
        }
      }
    }, interval);
    
    logger.info(`Started health check with interval ${interval}ms`);
  }
  
  public stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.info('Stopped health check');
    }
  }
  
  public async getCurrentNodeMetrics(): Promise<PartialNodeMetrics> {
    return await this.performanceService.getCurrentMetrics();
  }
}
