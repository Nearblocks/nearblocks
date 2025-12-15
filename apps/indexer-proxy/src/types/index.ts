import type { Message } from 'nb-blocks';

export type { Message };

export enum BlockSource {
  CACHE = 'cache',
  DISK = 'disk',
  NEAR_LAKE = 'near_lake',
  NEARDATA = 'neardata',
  S3 = 's3',
}

export type BlockFetchResult = {
  block: Message;
  source: BlockSource;
};

export type UploadTask = {
  attempts: number;
  block: Message;
  height: number;
  nextRetry: number;
};
