import QuickLRU from 'quick-lru';

import config from '#config';

export const lru = new QuickLRU<string, string>({ maxSize: config.cacheItems });
