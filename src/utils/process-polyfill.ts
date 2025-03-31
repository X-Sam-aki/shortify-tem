
/**
 * This file provides polyfills for the Node.js process object
 * that some libraries expect to exist in the browser environment
 */

// Create a minimal process polyfill for browser environments
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      NODE_ENV: 'production', // Default to production
    },
    nextTick: (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0),
    version: '',
    versions: { node: '0.0.0' },
    platform: 'browser'
  };
}

// Make sure process.env exists
if (typeof window !== 'undefined' && (window as any).process && !(window as any).process.env) {
  (window as any).process.env = {};
}

export const setupProcessPolyfill = () => {
  // This function can be called to ensure the polyfill is applied
  // It doesn't need to do anything since the polyfill is applied when this module is imported
  console.log('Process polyfill setup complete');
};
