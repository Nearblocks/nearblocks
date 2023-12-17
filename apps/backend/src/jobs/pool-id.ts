import { parentPort } from 'worker_threads';

import * as tasks from '#jobs/tasks';
import { redisClient } from '#libs/redis';
import { PublishTopic } from '#types/types';

(async () => {
  try {
    const publish: PublishTopic = (topic) => {
      void topic;
    };
    await redisClient.connect();
    await tasks.poolIdsCheck.fn(publish);
  } catch (error: unknown) {
    //
  }
  await redisClient.disconnect();
  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
