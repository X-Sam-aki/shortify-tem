
// Type declarations for various Node.js modules used in the codebase
// These are just stub declarations to prevent TypeScript errors

declare module 'aws-sdk' {
  export class S3 {
    constructor(options?: any);
    upload(params: any): { promise(): Promise<any> };
    listObjects(params: any): { promise(): Promise<any> };
    deleteObject(params: any): { promise(): Promise<any> };
  }
}

declare module 'ioredis' {
  interface RedisOptions {
    host?: string;
    port?: number;
    password?: string;
    retryStrategy?: (times: number) => number;
  }

  class Redis {
    constructor(options?: RedisOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, expiryMode?: string, time?: number): Promise<any>;
    del(...keys: string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    exists(key: string): Promise<number>;
    mget(...keys: string[]): Promise<(string | null)[]>;
    pipeline(): Redis;
    exec(): Promise<any[]>;
    quit(): Promise<void>;
    isOpen: boolean;
    on(event: string, listener: Function): void;
    info(section?: string): Promise<string>;
  }

  export default Redis;
}

declare module 'bull' {
  interface JobOptions {
    attempts?: number;
    backoff?: { type: string; delay: number };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  }

  class Job {
    id: string;
    data: any;
    opts: JobOptions;
    retry(): Promise<void>;
  }

  interface QueueOptions {
    redis?: { host: string; port: number; password?: string };
    defaultJobOptions?: JobOptions;
  }

  class Queue {
    constructor(name: string, options?: QueueOptions);
    on(event: string, callback: Function): void;
    add(data: any, options?: JobOptions): Promise<Job>;
    getJob(jobId: string): Promise<Job | null>;
    getWaitingCount(): Promise<number>;
    getActiveCount(): Promise<number>;
    getCompletedCount(): Promise<number>;
    getFailedCount(): Promise<number>;
    getDelayedCount(): Promise<number>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    clean(grace: number, status: string): Promise<void>;
    getFailed(): Promise<Job[]>;
    close(): Promise<void>;
  }

  export default Queue;
}

declare module 'cron' { 
  export class CronJob {
    constructor(
      cronTime: string,
      onTick: () => void,
      onComplete: null | (() => void),
      start: boolean,
      timezone: string
    );
    start(): void;
    stop(): void;
    running: boolean;
  }
}

declare module 'nodemailer' {
  interface TransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }

  interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
  }

  interface Transporter {
    sendMail(options: MailOptions): Promise<any>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}

declare module 'limiter' {
  interface RateLimiterOptions {
    tokensPerInterval: number;
    interval: number;
  }

  export class RateLimiter {
    constructor(options: RateLimiterOptions);
    tryRemoveTokens(count: number): Promise<boolean>;
  }
}

// Mock for cheerio
declare module 'cheerio' {
  export function load(html: string): CheerioAPI;
  
  interface CheerioAPI {
    (selector: string): Cheerio;
    text(): string;
    find(selector: string): Cheerio;
    attr(name: string): string;
    each(fn: (i: number, el: any) => void): void;
  }
  
  interface Cheerio {
    text(): string;
    find(selector: string): Cheerio;
    attr(name: string): string;
    each(fn: (i: number, el: any) => void): void;
  }
}

// Mock type declarations for missing extractors
declare module './extractors/amazonExtractor' {
  import { AbstractExtractor } from './baseExtractor';
  export class AmazonExtractor extends AbstractExtractor {}
}

declare module './extractors/walmartExtractor' {
  import { AbstractExtractor } from './baseExtractor';
  export class WalmartExtractor extends AbstractExtractor {}
}
