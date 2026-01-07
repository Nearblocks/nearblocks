import { Redis as IORedis, RedisKey, RedisOptions } from 'ioredis';

export * from 'ioredis';

export class Redis {
  prefix: string;
  redis: IORedis;

  constructor(prefixString: string, options: RedisOptions) {
    options.enableOfflineQueue = options.enableOfflineQueue ?? false;
    options.maxRetriesPerRequest = options.maxRetriesPerRequest ?? null;

    this.prefix = prefixString;
    this.redis = new IORedis(options);
  }

  async cache<T>(
    key: RedisKey,
    callback: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const prefixedKeys = this.prefixedKeys(key);
    const value = await this.get(prefixedKeys);

    if (value) {
      return JSON.parse(value);
    }

    const data = await callback();

    if (data) {
      await this.set(prefixedKeys, JSON.stringify(data), ttl);
    }

    return data;
  }

  client() {
    return this.redis;
  }

  get(key: RedisKey) {
    return this.redis.get(this.prefixedKeys(key));
  }

  async parse(key: RedisKey) {
    const value = await this.redis.get(this.prefixedKeys(key));

    return value && JSON.parse(value);
  }

  prefixedKeys(key: RedisKey): string;
  prefixedKeys(key: RedisKey[]): string[];
  prefixedKeys(keys: RedisKey | RedisKey[]) {
    if (Array.isArray(keys)) {
      return keys.map((key) => `${this.prefix}:${key}`);
    }

    return `${this.prefix}:${keys}`;
  }

  quit() {
    return this.redis.quit();
  }

  set(key: RedisKey, value: string, ttl?: number) {
    if (ttl) {
      return this.redis.setex(this.prefixedKeys(key), ttl, value);
    }

    return this.redis.set(this.prefixedKeys(key), value);
  }

  stringify(key: RedisKey, value: unknown, ttl?: number) {
    if (ttl) {
      return this.redis.setex(
        this.prefixedKeys(key),
        ttl,
        JSON.stringify(value),
      );
    }

    return this.redis.set(this.prefixedKeys(key), JSON.stringify(value));
  }
}
