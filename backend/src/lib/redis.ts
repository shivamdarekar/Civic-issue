import { createClient } from 'redis';
import { env } from '../config';

export const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: process.env.REDIS_USE_TLS === 'true' ? {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    tls: true,
    connectTimeout: 5000,
  } : {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    connectTimeout: 5000,
  },
});

redis.on('error', (err: any) => {
  console.warn('⚠️  Redis connection failed:', err.message);
  console.log('📝 Application will continue without Redis caching');
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('disconnect', () => console.log('🔌 Redis disconnected'));

let initialized = false;
export const connectRedis = async (): Promise<void> => {
  if (!initialized) {
    try {
      await redis.connect();
      initialized = true;
      console.log('✅ Redis connected successfully');
    } catch (error: any) {
      console.warn('⚠️  Redis connection failed:', error.message);
      console.log('📝 Application will continue without Redis caching');
      // Don't throw error - let app continue without Redis
    }
  }
};

// Session helpers (keyed by JWT jti)
const sessionKey = (jti: string) => `auth:session:${jti}`;
const blacklistKey = (jti: string) => `auth:blacklist:${jti}`;

export const setSession = async (jti: string, data: Record<string, unknown>, ttlSec: number): Promise<void> => {
  await connectRedis();
  await redis.set(sessionKey(jti), JSON.stringify(data), { EX: Math.max(ttlSec - 30, 1) });
};

export const getSession = async <T = any>(jti: string): Promise<T | null> => {
  await connectRedis();
  const raw = await redis.get(sessionKey(jti));
  return raw ? JSON.parse(raw) as T : null;
};

export const delSession = async (jti: string): Promise<void> => {
  await connectRedis();
  await redis.del(sessionKey(jti));
};

export const blacklist = async (jti: string, ttlSec: number): Promise<void> => {
  await connectRedis();
  await redis.set(blacklistKey(jti), '1', { EX: ttlSec });
};

export const isBlacklisted = async (jti: string): Promise<boolean> => {
  await connectRedis();
  const exists = await redis.exists(blacklistKey(jti));
  return exists === 1;
};