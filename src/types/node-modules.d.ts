
// Type declarations for various Node.js modules used in the codebase
// These are just stub declarations to prevent TypeScript errors

declare module 'aws-sdk' {}
declare module 'ioredis' {}
declare module 'bull' {}
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
declare module 'nodemailer' {}
declare module 'limiter' {}

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
