import {
  createClient,
  RedisClientOptions,
  RedisClientType,
  RedisDefaultModules,
  RedisModules,
  RedisScripts,
} from 'redis';

export class Redis {
  prefix: string;
  redis: RedisClientType<
    RedisDefaultModules & RedisModules,
    RedisDefaultModules,
    RedisScripts
  >;

  constructor(
    prefixString: string,
    options: RedisClientOptions<
      RedisModules,
      RedisDefaultModules,
      RedisScripts
    >,
  ) {
    this.prefix = prefixString;
    this.redis = createClient(options);
  }

  getClient() {
    return this.redis;
  }

  getPrefixedKeys(key: string): string;
  getPrefixedKeys(key: string[]): string[];
  getPrefixedKeys(key: string | string[]): string | string[] {
    if (Array.isArray(key)) {
      return key.map((k) => `${this.prefix}:${k}`);
    }

    return `${this.prefix}:${key}`;
  }
}
