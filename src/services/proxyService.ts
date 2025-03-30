import { RateLimiter } from 'limiter';

interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  country?: string;
  lastUsed?: number;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
}

export class ProxyService {
  private static instance: ProxyService;
  private proxies: ProxyConfig[];
  private currentIndex: number;
  private rateLimiter: RateLimiter;
  private readonly PROXY_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_FAILURES = 3;
  private readonly MIN_SUCCESS_RATE = 0.7;

  private constructor() {
    this.proxies = this.loadProxies();
    this.currentIndex = 0;
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 5,
      interval: 'second'
    });
  }

  public static getInstance(): ProxyService {
    if (!ProxyService.instance) {
      ProxyService.instance = new ProxyService();
    }
    return ProxyService.instance;
  }

  private loadProxies(): ProxyConfig[] {
    // Load proxies from environment variables or configuration
    const proxyList = process.env.PROXY_LIST ? JSON.parse(process.env.PROXY_LIST) : [];
    return proxyList.map((proxy: string) => {
      const [host, port, username, password] = proxy.split(':');
      return {
        host,
        port: parseInt(port),
        username,
        password,
        successRate: 1,
        totalRequests: 0,
        failedRequests: 0
      };
    });
  }

  private async waitForRateLimit(): Promise<void> {
    const hasToken = await this.rateLimiter.tryRemoveTokens(1);
    if (!hasToken) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.waitForRateLimit();
    }
  }

  private getNextProxy(): ProxyConfig {
    // Round-robin proxy selection with health check
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

      if (this.isProxyHealthy(proxy)) {
        return proxy;
      }
      attempts++;
    }

    throw new Error('No healthy proxies available');
  }

  private isProxyHealthy(proxy: ProxyConfig): boolean {
    if (proxy.totalRequests === 0) return true;
    
    const successRate = proxy.successRate;
    const recentFailures = proxy.failedRequests;
    
    return successRate >= this.MIN_SUCCESS_RATE && recentFailures < this.MAX_FAILURES;
  }

  public async fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
    await this.waitForRateLimit();
    
    const proxy = this.getNextProxy();
    const proxyUrl = `http://${proxy.host}:${proxy.port}`;
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        ...options,
        agent: new (require('https-proxy-agent'))(proxyUrl, {
          auth: proxy.username && proxy.password ? 
            `${proxy.username}:${proxy.password}` : undefined,
          timeout: this.PROXY_TIMEOUT
        })
      });

      const duration = Date.now() - startTime;
      this.updateProxyStats(proxy, true, duration);

      return response;
    } catch (error) {
      this.updateProxyStats(proxy, false);
      throw error;
    }
  }

  private updateProxyStats(proxy: ProxyConfig, success: boolean, duration?: number): void {
    proxy.totalRequests++;
    if (success) {
      proxy.successRate = (proxy.successRate * (proxy.totalRequests - 1) + 1) / proxy.totalRequests;
      proxy.failedRequests = 0;
    } else {
      proxy.successRate = (proxy.successRate * (proxy.totalRequests - 1)) / proxy.totalRequests;
      proxy.failedRequests++;
    }
    proxy.lastUsed = Date.now();
  }

  public getProxyStats(): ProxyConfig[] {
    return this.proxies.map(proxy => ({ ...proxy }));
  }

  public addProxy(proxy: ProxyConfig): void {
    this.proxies.push(proxy);
  }

  public removeProxy(host: string, port: number): void {
    this.proxies = this.proxies.filter(
      proxy => !(proxy.host === host && proxy.port === port)
    );
  }
} 