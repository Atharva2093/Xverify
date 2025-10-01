// Xverify Performance Optimization
// Lazy load model, use Web Workers, debounce, caching, monitoring

let modelLoaded = false;
let modelLoadStart = 0;
let modelLoadEnd = 0;
let cache = {};

export function lazyLoadModel(loadFn) {
  if (modelLoaded) return Promise.resolve();
  modelLoadStart = performance.now();
  return loadFn().then(() => {
    modelLoaded = true;
    modelLoadEnd = performance.now();
    console.timeEnd('ModelLoad');
  });
}

export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function cacheResult(key, value) {
  cache[key] = value;
}

export function getCachedResult(key) {
  return cache[key];
}

export function monitorPerformance(label) {
  console.time(label);
  return () => console.timeEnd(label);
}
