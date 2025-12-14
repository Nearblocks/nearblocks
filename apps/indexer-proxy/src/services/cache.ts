import { LRUCache } from 'lru-cache';

import { logger } from 'nb-logger';

import { config } from '#config.js';
import { Message } from '#types/index.js';

export class BlockCache {
  private cache: LRUCache<number, Message>;

  constructor() {
    this.cache = new LRUCache<number, Message>({
      max: config.CACHE_MAX_BLOCKS,
      ttl: config.CACHE_TTL_MS,
      updateAgeOnGet: true,
      updateAgeOnHas: false,
    });

    logger.info(
      `Block cache initialized with max ${config.CACHE_MAX_BLOCKS} blocks`,
    );
  }

  clear(): void {
    this.cache.clear();
  }

  get(height: number): Message | undefined {
    return this.cache.get(height);
  }

  has(height: number): boolean {
    return this.cache.has(height);
  }

  set(height: number, block: Message): void {
    this.cache.set(height, block);
  }

  size(): number {
    return this.cache.size;
  }
}
