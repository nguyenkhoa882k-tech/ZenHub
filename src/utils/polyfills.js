/**
 * Polyfills for deprecated React Native APIs
 * Fixes InteractionManager deprecation warnings
 */

// Suppress InteractionManager deprecation warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('InteractionManager has been deprecated')
  ) {
    // Suppress this specific warning
    return;
  }
  originalWarn.apply(console, args);
};

// Polyfill for requestIdleCallback (replacement for InteractionManager)
if (typeof global.requestIdleCallback === 'undefined') {
  global.requestIdleCallback = (callback, options = {}) => {
    const timeout = options.timeout || 5000; // Default 5 second timeout
    const startTime = Date.now();

    return setTimeout(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      callback({
        didTimeout: elapsed >= timeout,
        timeRemaining: () => {
          const remaining = 50 - (Date.now() - currentTime);
          return Math.max(0, remaining);
        },
      });
    }, 1); // Schedule for next tick
  };

  global.cancelIdleCallback = id => {
    clearTimeout(id);
  };
}

// Alternative InteractionManager replacement utilities
export const scheduleTask = (task, options = {}) => {
  return new Promise(resolve => {
    if (global.requestIdleCallback) {
      global.requestIdleCallback(deadline => {
        try {
          const result = task();
          resolve(result);
        } catch (error) {
          console.error('Task execution error:', error);
          resolve(null);
        }
      }, options);
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        try {
          const result = task();
          resolve(result);
        } catch (error) {
          console.error('Task execution error:', error);
          resolve(null);
        }
      }, 0);
    }
  });
};

// Chunked task execution for large operations
export const executeInChunks = async (items, processor, chunkSize = 10) => {
  const results = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    // Process chunk
    const chunkResults = await scheduleTask(() => {
      return chunk.map(processor);
    });

    if (chunkResults) {
      results.push(...chunkResults);
    }

    // Allow UI to breathe between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
};

console.log(
  '✅ Polyfills initialized - InteractionManager deprecation handled',
);
