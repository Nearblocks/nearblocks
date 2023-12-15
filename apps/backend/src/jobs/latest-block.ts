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
    await tasks.latestBlockCheck.fn(publish);
  } catch (error: unknown) {
    console.log({ error });
  }

  await redisClient.disconnect();
  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
