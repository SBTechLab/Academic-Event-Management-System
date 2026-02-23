const cache = new Map();
const CACHE_DURATION = 60000; // 60 seconds

export const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

export const setCachedData = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (key) => {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
};

export const fetchWithCache = async (url, options = {}) => {
    const cacheKey = url + JSON.stringify(options);
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;
    
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Network error');
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    
    return data;
};
