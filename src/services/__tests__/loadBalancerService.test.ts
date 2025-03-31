
import { LoadBalancerService } from '../loadBalancerService';
import { jest } from '@jest/globals';
import { NodeInfo, NodeMetrics, PartialNodeMetrics } from '@/types/loadBalancer';

// Mock the dependencies
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock service singletons
jest.mock('../queueService', () => ({
  QueueService: {
    getInstance: jest.fn().mockReturnValue({})
  }
}));

jest.mock('../performanceService', () => ({
  PerformanceService: {
    getInstance: jest.fn().mockReturnValue({
      getCurrentMetrics: jest.fn().mockResolvedValue({
        system: {
          cpu: { usage: 20, cores: 4, load: [1, 1, 1] },
          memory: { used: 4000, total: 8000, free: 4000, swap: { total: 2000, used: 500, free: 1500 } },
        },
        queue: { waiting: 5 }
      } as PartialNodeMetrics)
    })
  }
}));

// Mock the singleton pattern for testing
jest.mock('../loadBalancerService', () => {
  const originalModule = jest.requireActual('../loadBalancerService');
  // Use the actual implementation but override getInstance
  return {
    ...originalModule,
    LoadBalancerService: originalModule.LoadBalancerService
  };
});

describe('LoadBalancerService', () => {
  let loadBalancerService: LoadBalancerService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    // Create a new instance directly for testing
    loadBalancerService = new LoadBalancerService();
  });

  test('addNode should add a node to the cluster', async () => {
    const nodeInfo: NodeInfo = { id: 'node-1' };
    await loadBalancerService.addNode(nodeInfo);
    expect(loadBalancerService.getNodes()).toContainEqual(expect.objectContaining({ info: nodeInfo }));
  });

  test('updateNodeMetrics should update node metrics', async () => {
    const nodeId = 'node-1';
    await loadBalancerService.addNode({ id: nodeId });
    
    const metrics: NodeMetrics = {
      system: {
        cpu: {
          usage: 25,
          cores: 4,
          load: [1.5, 1.2, 1.0]
        },
        memory: {
          total: 16384,
          used: 8192,
          free: 8192,
          swap: {
            total: 8192,
            used: 1024,
            free: 7168
          }
        },
        disk: {
          total: 1024000,
          used: 512000,
          free: 512000
        },
        network: {
          interfaces: {
            eth0: {
              bytesReceived: 1024,
              bytesSent: 2048
            }
          }
        }
      },
      queue: {
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 1
      },
      cache: {
        hits: 500,
        misses: 100,
        errors: 0,
        size: 1024
      },
      api: {
        requests: 1000,
        errors: 10,
        avgResponseTime: 250
      }
    };
    
    await loadBalancerService.updateNodeMetrics(nodeId, metrics);
    const node = loadBalancerService.getNode(nodeId);
    expect(node?.metrics).toEqual(metrics);
  });

  test('removeNode should remove a node from the cluster', async () => {
    const nodeInfo: NodeInfo = { id: 'node-1' };
    await loadBalancerService.addNode(nodeInfo);
    await loadBalancerService.removeNode(nodeInfo.id);
    expect(loadBalancerService.getNodes()).not.toContainEqual(expect.objectContaining({ info: nodeInfo }));
  });

  test('getNode should return a node by ID', async () => {
    const nodeInfo: NodeInfo = { id: 'node-1' };
    await loadBalancerService.addNode(nodeInfo);
    const retrievedNode = loadBalancerService.getNode(nodeInfo.id);
    expect(retrievedNode).toEqual(expect.objectContaining({ info: nodeInfo }));
  });

  test('getNode should return undefined if node does not exist', () => {
    const retrievedNode = loadBalancerService.getNode('non-existent-node');
    expect(retrievedNode).toBeUndefined();
  });

  test('getNodes should return all nodes', async () => {
    const node1: NodeInfo = { id: 'node-1' };
    const node2: NodeInfo = { id: 'node-2' };
    await loadBalancerService.addNode(node1);
    await loadBalancerService.addNode(node2);
    const nodes = loadBalancerService.getNodes();
    expect(nodes).toContainEqual(expect.objectContaining({ info: node1 }));
    expect(nodes).toContainEqual(expect.objectContaining({ info: node2 }));
  });
});
