import { createClient } from 'redis';
import { LRUCache } from 'lru-cache';
import { env } from '../config';

export const redis = createClient({
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  socket: env.REDIS_USE_TLS === 'true'
    ? {
        host: env.REDIS_HOST,
        port: parseInt(env.REDIS_PORT, 10),
        tls: true,
        connectTimeout: 5000,
      }
    : {
        host: env.REDIS_HOST,
        port: parseInt(env.REDIS_PORT, 10),
        connectTimeout: 5000,
      },
});

type RedisStatus = 'unknown' | 'available' | 'unavailable';

let redisStatus: RedisStatus = 'unknown';
let connectPromise: Promise<boolean> | null = null;
const REDIS_CONNECT_TIMEOUT_MS = 3000;
const sessionMemoryCache = new LRUCache<string, string>({
  max: 2000,
  ttlAutopurge: true,
});
const blacklistMemoryCache = new LRUCache<string, true>({
  max: 2000,
  ttlAutopurge: true,
});

const logRedisFallback = (message?: string): void => {
  if (redisStatus === 'unavailable') {
    return;
  }

  redisStatus = 'unavailable';
  console.warn(`⚠️  Redis connection failed${message ? `: ${message}` : ''}`);
  console.log('📝 Application will continue without Redis caching');
};

redis.on('error', (err: Error) => {
  if (redisStatus !== 'available') {
    logRedisFallback(err.message);
    return;
  }

  console.warn('⚠️  Redis error:', err.message);
});

redis.on('connect', () => {
  redisStatus = 'available';
  console.log('✅ Redis connected');
});

redis.on('disconnect', () => {
  if (redisStatus === 'available') {
    redisStatus = 'unknown';
    console.log('🔌 Redis disconnected');
  }
});

export const isRedisAvailable = (): boolean => redisStatus === 'available' && redis.isOpen;

export const connectRedis = async (): Promise<boolean> => {
  if (isRedisAvailable()) {
    return true;
  }

  if (redisStatus === 'unavailable') {
    return false;
  }

  if (!connectPromise) {
    connectPromise = Promise.race([
      redis.connect(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Redis connection timed out')), REDIS_CONNECT_TIMEOUT_MS);
      }),
    ])
      .then(() => {
        redisStatus = 'available';
        return true;
      })
      .catch((error: Error) => {
        logRedisFallback(error.message);
        return false;
      })
      .finally(() => {
        connectPromise = null;
      });
  }

  return connectPromise;
};

const withRedisFallback = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  const available = await connectRedis();
  if (!available) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error: any) {
    logRedisFallback(error?.message);
    return fallback;
  }
};

// Session helpers (keyed by JWT jti)
const sessionKey = (jti: string) => `auth:session:${jti}`;
const blacklistKey = (jti: string) => `auth:blacklist:${jti}`;

export const setSession = async (jti: string, data: Record<string, unknown>, ttlSec: number): Promise<void> => {
  if (!isRedisAvailable()) {
    sessionMemoryCache.set(sessionKey(jti), JSON.stringify(data), { ttl: ttlSec * 1000 });
    return;
  }

  await withRedisFallback(async () => {
    await redis.set(sessionKey(jti), JSON.stringify(data), { EX: Math.max(ttlSec - 30, 1) });
  }, undefined);
};

export const getSession = async <T = any>(jti: string): Promise<T | null> => {
  if (!isRedisAvailable()) {
    const raw = sessionMemoryCache.get(sessionKey(jti));
    return raw ? JSON.parse(raw) as T : null;
  }

  return withRedisFallback(async () => {
    const raw = await redis.get(sessionKey(jti));
    return raw ? JSON.parse(raw) as T : null;
  }, null);
};

export const delSession = async (jti: string): Promise<void> => {
  if (!isRedisAvailable()) {
    sessionMemoryCache.delete(sessionKey(jti));
    return;
  }

  await withRedisFallback(async () => {
    await redis.del(sessionKey(jti));
  }, undefined);
};

export const blacklist = async (jti: string, ttlSec: number): Promise<void> => {
  if (!isRedisAvailable()) {
    blacklistMemoryCache.set(blacklistKey(jti), true, { ttl: ttlSec * 1000 });
    return;
  }

  await withRedisFallback(async () => {
    await redis.set(blacklistKey(jti), '1', { EX: ttlSec });
  }, undefined);
};

export const isBlacklisted = async (jti: string): Promise<boolean> => {
  if (!isRedisAvailable()) {
    return blacklistMemoryCache.has(blacklistKey(jti));
  }

  return withRedisFallback(async () => {
    const exists = await redis.exists(blacklistKey(jti));
    return exists === 1;
  }, false);
};