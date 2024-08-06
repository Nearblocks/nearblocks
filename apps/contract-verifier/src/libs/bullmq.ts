import { ConnectionOptions, Queue, QueueEvents, Worker } from 'bullmq';

import { redisClient } from '#libs/redis';

const connection = redisClient as ConnectionOptions;

// Initialize the BullMQ Queue
const contractVerificationQueue = new Queue('contract-verification-queue', {
  connection,
});
const contractVerificationQueueEvents = new QueueEvents(
  'contract-verification-queue',
  { connection },
);

export {
  connection,
  contractVerificationQueue,
  contractVerificationQueueEvents,
  Worker,
};
