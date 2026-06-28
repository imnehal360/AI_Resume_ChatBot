const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL;
let redisClient = null;
let isRedisReady = false;

if (redisUrl) {
  redisClient = createClient({ url: redisUrl });

  redisClient.on("error", (err) => {
    console.warn("[Redis] ⚠️ Connection error:", err.message);
    isRedisReady = false;
  });

  redisClient.on("connect", () => {
    console.log("[Redis] 🔌 Connecting to Redis server...");
  });

  redisClient.on("ready", () => {
    console.log("[Redis] ✅ Connected and ready!");
    isRedisReady = true;
  });

  // Connect asynchronously without blocking main thread
  redisClient.connect().catch((err) => {
    console.warn("[Redis] ❌ Initial connection failed:", err.message);
    isRedisReady = false;
  });
} else {
  console.log("[Redis] ℹ️ REDIS_URL not configured. Running without cache (Direct Database Fallback).");
}

// Helper: Get cached JSON data
async function getCache(key) {
  if (!isRedisReady || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`[Redis] Error getting key "${key}":`, err.message);
    return null;
  }
}

// Helper: Set cache with expiration (TTL in seconds)
async function setCache(key, value, ttlSeconds = 3600) {
  if (!isRedisReady || !redisClient) return false;
  try {
    const dataStr = JSON.stringify(value);
    await redisClient.set(key, dataStr, { EX: ttlSeconds });
    return true;
  } catch (err) {
    console.error(`[Redis] Error setting key "${key}":`, err.message);
    return false;
  }
}

// Helper: Delete keys matching a pattern (e.g. "recommendations:123:*")
async function deleteCachePattern(pattern) {
  if (!isRedisReady || !redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Redis] 🗑 Cleared ${keys.length} cached keys matching: "${pattern}"`);
    }
    return true;
  } catch (err) {
    console.error(`[Redis] Error deleting pattern "${pattern}":`, err.message);
    return false;
  }
}

module.exports = {
  redisClient,
  isRedisReady: () => isRedisReady,
  getCache,
  setCache,
  deleteCachePattern
};
