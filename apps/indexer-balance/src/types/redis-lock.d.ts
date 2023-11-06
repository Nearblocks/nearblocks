declare module 'redis-lock' {
  import {
    RedisClientType,
    RedisDefaultModules,
    RedisFunctions,
    RedisModules,
    RedisScripts,
  } from 'redis';

  function redisLock(
    client: RedisClientType<
      RedisDefaultModules & RedisModules,
      RedisFunctions,
      RedisScripts
    >,
    retryDelay?: number,
  ): (lockName: string, timeout?: number) => Promise<() => Promise<void>>;

  export default redisLock;
}
