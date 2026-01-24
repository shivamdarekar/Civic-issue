import { redis, connectRedis } from './redis';

const ensureRedis = async (): Promise<void> => {
  if (!redis.isOpen) await connectRedis();
};

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    await ensureRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number): Promise<void> => {
  try {
    await ensureRedis();
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await ensureRedis();
    await redis.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    await ensureRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
  }
};

export const incrementCache = async (key: string, ttl?: number): Promise<number> => {
  try {
    await ensureRedis();
    const count = await redis.incr(key);
    if (ttl && count === 1) {
      await redis.expire(key, ttl);
    }
    return count;
  } catch (error) {
    console.error(`Cache increment error for key ${key}:`, error);
    return 0;
  }
};

export interface CacheConfig {
  ttl: number;
  prefix: string;
}

export const CACHE_CONFIGS = {
  USER_PROFILE: { ttl: 1800, prefix: 'user:profile' },
  USER_DASHBOARD: { ttl: 1200, prefix: 'user:dashboard' },
  ISSUES_LIST: { ttl: 600, prefix: 'issues:list' },
  ISSUE_DETAIL: { ttl: 1200, prefix: 'issue:detail' },
  ADMIN_STATS: { ttl: 900, prefix: 'admin:stats' },
  WARD_DATA: { ttl: 1800, prefix: 'ward:data' },
  ZONE_DATA: { ttl: 1800, prefix: 'zone:data' },
  GEO_DATA: { ttl: 3600, prefix: 'geo:data' },
} as const;

class CacheManager {
  private key(config: CacheConfig, identifier: string): string {
    return `${config.prefix}:${identifier}`;
  }

  async get<T>(config: CacheConfig, identifier: string): Promise<T | null> {
    return getCache<T>(this.key(config, identifier));
  }

  async set(config: CacheConfig, identifier: string, data: any): Promise<void> {
    await setCache(this.key(config, identifier), data, config.ttl);
  }

  async delete(config: CacheConfig, identifier: string): Promise<void> {
    await deleteCache(this.key(config, identifier));
  }

  async deletePattern(config: CacheConfig, pattern: string = '*'): Promise<void> {
    await deleteCachePattern(`${config.prefix}:${pattern}`);
  }

  async getOrSet<T>(
    config: CacheConfig, 
    identifier: string, 
    fallback: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(config, identifier);
    if (cached !== null) return cached;

    const data = await fallback();
    await this.set(config, identifier, data);
    return data;
  }

  // User-specific cache operations
  async getUserProfile(userId: string) {
    return this.get(CACHE_CONFIGS.USER_PROFILE, userId);
  }

  async setUserProfile(userId: string, profile: any): Promise<void> {
    await this.set(CACHE_CONFIGS.USER_PROFILE, userId, profile);
  }

  // Admin cache operations
  async invalidateAdminCache(): Promise<void> {
    await this.deletePattern(CACHE_CONFIGS.ADMIN_STATS);
  }

  // Invalidate user-specific caches
  async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.delete(CACHE_CONFIGS.USER_PROFILE, userId),
      this.delete(CACHE_CONFIGS.USER_DASHBOARD, userId),
      deleteCachePattern(`${CACHE_CONFIGS.ISSUES_LIST.prefix}:*:${userId}`),
      deleteCachePattern(`${CACHE_CONFIGS.ISSUE_DETAIL.prefix}:*`),
      deleteCachePattern(`user:activity:${userId}:*`),
    ]);
  }

  // Invalidate issue-specific caches with user context
  async invalidateIssueCache(issueId?: string): Promise<void> {
    await Promise.all([
      this.deletePattern(CACHE_CONFIGS.ISSUES_LIST),
      this.deletePattern(CACHE_CONFIGS.USER_DASHBOARD),
      this.deletePattern(CACHE_CONFIGS.ADMIN_STATS),
      deleteCachePattern(`issue:stats:*`),
      issueId ? this.delete(CACHE_CONFIGS.ISSUE_DETAIL, issueId) : Promise.resolve(),
    ]);
  }

  // Geographic data cache
  async getGeoData(key: string): Promise<any> {
    return this.get(CACHE_CONFIGS.GEO_DATA, key);
  }

  async setGeoData(key: string, data: any): Promise<void> {
    await this.set(CACHE_CONFIGS.GEO_DATA, key, data);
  }

  // Bulk invalidation for data changes
  async invalidateRelatedCache(type: 'user' | 'issue' | 'ward' | 'zone', id?: string): Promise<void> {
    switch (type) {
      case 'user':
        if (id) await this.invalidateUserCache(id);
        break;
      case 'issue':
        await this.invalidateIssueCache(id);
        break;
      case 'ward':
        await Promise.all([
          this.deletePattern(CACHE_CONFIGS.WARD_DATA, id || '*'),
          this.deletePattern(CACHE_CONFIGS.ADMIN_STATS),
        ]);
        break;
      case 'zone':
        await Promise.all([
          this.deletePattern(CACHE_CONFIGS.ZONE_DATA, id || '*'),
          this.deletePattern(CACHE_CONFIGS.ADMIN_STATS),
        ]);
        break;
    }
  }
}

export const cache = new CacheManager();