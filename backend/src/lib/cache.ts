import { redis, connectRedis } from './redis';

const ensureRedis = async (): Promise<void> => {
  try {
    if (!redis.isOpen) await connectRedis();
  } catch (error) {
    // Silently fail - app continues without Redis
  }
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
  USER_DASHBOARD: { ttl: 300, prefix: 'user:dashboard' }, // Reduced for real-time data
  ISSUES_LIST: { ttl: 180, prefix: 'issues:list' }, // Reduced for frequent updates
  ISSUE_DETAIL: { ttl: 600, prefix: 'issue:detail' },
  ADMIN_STATS: { ttl: 300, prefix: 'admin:stats' }, // Reduced for real-time stats
  WARD_DATA: { ttl: 1800, prefix: 'ward:data' },
  ZONE_DATA: { ttl: 1800, prefix: 'zone:data' },
  GEO_DATA: { ttl: 3600, prefix: 'geo:data' },
  QUERY_CACHE: { ttl: 300, prefix: 'query:cache' }, // New: Query-level cache
  SPATIAL_CACHE: { ttl: 1800, prefix: 'spatial:cache' }, // New: Spatial queries cache
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

  // Query-level caching for expensive operations
  async cacheQuery<T>(queryKey: string, queryFn: () => Promise<T>, ttl: number = 300): Promise<T> {
    const fullKey = `${CACHE_CONFIGS.QUERY_CACHE.prefix}:${queryKey}`;
    
    // Check cache first
    const cached = await getCache<T>(fullKey);
    if (cached !== null) return cached;

    // Execute query and cache result - SINGLE SAVE
    const result = await queryFn();
    await setCache(fullKey, result, ttl);
    return result;
  }

  // Spatial query caching
  async cacheSpatialQuery<T>(coordinates: string, queryFn: () => Promise<T>): Promise<T> {
    const spatialKey = `coords:${coordinates}`;
    return this.cacheQuery(spatialKey, queryFn, CACHE_CONFIGS.SPATIAL_CACHE.ttl);
  }

  // Bulk cache operations for better performance
  async setBulk(items: Array<{ key: string; value: any; ttl: number }>): Promise<void> {
    try {
      await ensureRedis();
      const pipeline = redis.multi();
      
      items.forEach(({ key, value, ttl }) => {
        pipeline.setEx(key, ttl, JSON.stringify(value));
      });
      
      await pipeline.exec();
    } catch (error) {
      console.error('Bulk cache set error:', error);
    }
  }

  // Ward-specific cache invalidation to prevent cross-contamination
  async invalidateWardCache(wardId: string): Promise<void> {
    await Promise.all([
      deleteCachePattern(`issue:stats:ward:${wardId}:*`),
      deleteCachePattern(`issues:list:ward:${wardId}:*`),
      deleteCachePattern(`assignee:lookup:ward:${wardId}:*`),
      deleteCachePattern(`user:dashboard:*:ward:${wardId}:*`),
    ]);
  }

  // Zone-specific cache invalidation
  async invalidateZoneCache(zoneId: string): Promise<void> {
    await Promise.all([
      deleteCachePattern(`issue:stats:zone:${zoneId}:*`),
      deleteCachePattern(`issues:list:zone:${zoneId}:*`),
      deleteCachePattern(`user:dashboard:*:zone:${zoneId}:*`),
    ]);
  }

  // Generic related cache invalidation
  async invalidateRelatedCache(type: 'ward' | 'zone', id: string): Promise<void> {
    if (type === 'ward') {
      await this.invalidateWardCache(id);
    } else if (type === 'zone') {
      await this.invalidateZoneCache(id);
    }
  }

  // Direct cache deletion with pattern support
  async deleteCache(pattern: string): Promise<void> {
    await deleteCachePattern(pattern);
  }
}

export const cache = new CacheManager();