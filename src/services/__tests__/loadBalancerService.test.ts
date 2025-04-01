
import { LoadBalancerService } from '../loadBalancerService';
import { NodeMetrics } from '@/types/loadBalancer';

describe('LoadBalancerService', () => {
  let loadBalancer: LoadBalancerService;

  beforeEach(() => {
    loadBalancer = new LoadBalancerService();
  });

  test('should initialize with empty nodes', () => {
    expect(loadBalancer.getNodes()).toEqual([]);
  });

  test('should add a node', () => {
    const node = {
      id: 'node1',
      url: 'http://node1.example.com',
      metrics: {
        requestCount: 0,
        responseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
        lastUpdateTime: Date.now()
      }
    };

    loadBalancer.addNode(node);
    expect(loadBalancer.getNodes()).toContain(node);
  });

  test('should remove a node', () => {
    const node = {
      id: 'node1',
      url: 'http://node1.example.com',
      metrics: {
        requestCount: 0,
        responseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
        lastUpdateTime: Date.now()
      }
    };

    loadBalancer.addNode(node);
    loadBalancer.removeNode('node1');
    expect(loadBalancer.getNodes()).not.toContain(node);
  });

  test('should update node metrics', () => {
    const node = {
      id: 'node1',
      url: 'http://node1.example.com',
      metrics: {
        requestCount: 0,
        responseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
        lastUpdateTime: Date.now()
      }
    };

    loadBalancer.addNode(node);
    
    const updatedMetrics: NodeMetrics = {
      requestCount: 10,
      responseTime: 200,
      errorRate: 0.05,
      memoryUsage: 0.7,
      lastUpdateTime: Date.now()
    };
    
    loadBalancer.updateNodeMetrics('node1', updatedMetrics);
    expect(loadBalancer.getNode('node1')?.metrics).toEqual(updatedMetrics);
  });

  test('should select the node with least load', () => {
    const node1 = {
      id: 'node1',
      url: 'http://node1.example.com',
      metrics: {
        requestCount: 20,
        responseTime: 150,
        errorRate: 0.02,
        memoryUsage: 0.8,
        lastUpdateTime: Date.now()
      }
    };

    const node2 = {
      id: 'node2',
      url: 'http://node2.example.com',
      metrics: {
        requestCount: 10,
        responseTime: 100,
        errorRate: 0.01,
        memoryUsage: 0.4,
        lastUpdateTime: Date.now()
      }
    };

    loadBalancer.addNode(node1);
    loadBalancer.addNode(node2);

    const selected = loadBalancer.selectNode();
    expect(selected).toEqual(node2);
  });

  test('should handle health check', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    
    const node = {
      id: 'node1',
      url: 'http://node1.example.com',
      metrics: {
        requestCount: 0,
        responseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
        lastUpdateTime: Date.now()
      }
    };

    loadBalancer.addNode(node);
    await loadBalancer.checkNodeHealth('node1');
    
    expect(mockFetch).toHaveBeenCalledWith('http://node1.example.com/health');
    expect(loadBalancer.getNode('node1')?.isHealthy).toBe(true);
  });
});
