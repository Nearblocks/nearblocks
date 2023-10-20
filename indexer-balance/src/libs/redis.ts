import redisLock from 'redis-lock';
import { createClient } from 'redis';

import config from '#config';

const redis = createClient({ url: config.redisUrl });

export const redLock = redisLock(redis);

export default redis;
