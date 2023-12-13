import { parentPort } from 'worker_threads';

import * as tasks from '#jobs/tasks';
import { PublishTopic } from '#types/types';

(async () => {
  try {
    const publish: PublishTopic = (topic) => {
      void topic;
    };
    await tasks.redisConnect();
    await tasks.updatePoolInfoMap.fn(publish);
  } catch (error: unknown) {
    //
  }

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
