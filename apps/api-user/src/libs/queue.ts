import { Queue, WorkerOptions } from 'bullmq';

import { RedisOptions } from 'nb-redis';

import redis from '#libs/redis';

const DELAY = 10 * 1000;

export const emailQueue = new Queue('email', {
  connection: {
    host: redis.client().options.host,
    password: redis.client().options.password,
    port: redis.client().options.port,
  } as RedisOptions,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      delay: DELAY,
      type: 'exponential',
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
});

export const emailQueueOptions: WorkerOptions = {
  connection: {
    host: redis.client().options.host,
    password: redis.client().options.password,
    port: redis.client().options.port,
  } as RedisOptions,
  limiter: {
    duration: 1000,
    max: 1,
  },
};
