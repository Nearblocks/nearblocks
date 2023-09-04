import { createClient } from 'redis';

import config from '#config';

const redis = createClient({ url: config.redisUrl });

export default redis;
