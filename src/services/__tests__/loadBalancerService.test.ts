
import { LoadBalancerService } from '../loadBalancerService';
import { NodeInfo, NodeMetrics, PartialNodeMetrics } from '@/types/loadBalancer';
import { QueueService } from '../queueService';
import { PerformanceService } from '../performanceService';

// Mock the services used by LoadBalancerService
jest.mock('../queueService', () => ({
  QueueService: {
    getInstance: jest.fn().mockReturnValue({
      // Add mock implementations as needed
    })
  }
}));

jest.mock('../performanceService', () => ({
  PerformanceService: {
    getInstance: jest.fn().mockReturnValue({
      getCurrentMetrics: jest.fn().mockResolvedValue({
        cpuUsage: 0.5,
        memoryUsage: 0.3,
        activeRequests: 10
      })
    })
  }
}));

describe('LoadBalancerService', () => {
  let service: LoadBalancerService;
  
  beforeEach(() => {
    service = LoadBalancerService.getInstance();
    // Reset nodes map for each test
    // @ts-ignore - accessing private property for testing
    service.nodes = new Map();
  });
  
  it('should add a node correctly', async () => {
    const nodeInfo: NodeInfo = {
      id: 'test-node-1',
      url: 'http://localhost:3001',
      status: 'online',
      capabilities: ['processing']
    };
    
    await service.addNode(nodeInfo);
    
    // @ts-ignore - accessing private property for testing
    const nodes = service.nodes;
    expect(nodes.has('test-node-1')).toBe(true);
    expect(nodes.get('test-node-1')?.info).toEqual(nodeInfo);
  });
  
  it('should update node metrics correctly', async () => {
    // First add a node
    const nodeInfo: NodeInfo = {
      id: 'test-node-1',
      url: 'http://localhost:3001',
      status: 'online',
      capabilities: ['processing']
    };
    
    await service.addNode(nodeInfo);
    
    // Then update its metrics
    const metrics: NodeMetrics = {
      cpuUsage: 0.75,
      memoryUsage: 0.5,
      activeRequests: 5,
      queueDepth: 2,
      lastResponseTime: 150
    };
    
    await service.updateNodeMetrics('test-node-1', metrics);
    
    // @ts-ignore - accessing private property for testing
    const nodes = service.nodes;
    expect(nodes.get('test-node-1')?.metrics).toEqual(metrics);
  });
  
  it('should throw an error when updating metrics for non-existent node', async () => {
    const metrics: NodeMetrics = {
      cpuUsage: 0.75,
      memoryUsage: 0.5,
      activeRequests: 5,
      queueDepth: 2,
      lastResponseTime: 150
    };
    
    await expect(service.updateNodeMetrics('non-existent-node', metrics))
      .rejects.toThrow('Node non-existent-node not found');
  });
  
  it('should get current node metrics', async () => {
    const metrics = await service.getCurrentNodeMetrics();
    expect(metrics).toEqual({
      cpuUsage: 0.5,
      memoryUsage: 0.3,
      activeRequests: 10
    });
  });
  
  it('should mark nodes as offline when they timeout', async () => {
    // Add a node
    const nodeInfo: NodeInfo = {
      id: 'test-node-1',
      url: 'http://localhost:3001',
      status: 'online',
      capabilities: ['processing']
    };
    
    await service.addNode(nodeInfo);
    
    // @ts-ignore - accessing private property for testing
    const node = service.nodes.get('test-node-1');
    
    // Set lastSeen to more than 60 seconds ago
    if (node) {
      node.lastSeen = new Date(Date.now() - 70000);
    }
    
    // Run health check
    // @ts-ignore - accessing private method for testing
    await service.startHealthCheck(100); // Small interval for testing
    
    // Wait for health check to run
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // @ts-ignore - accessing private property for testing
    service.stopHealthCheck();
    
    // @ts-ignore - accessing private property for testing
    const updatedNode = service.nodes.get('test-node-1');
    expect(updatedNode?.info.status).toBe('offline');
  });
});
