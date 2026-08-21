import type { Metadata } from 'next';

import { SearchParams } from '@/types/types';

const hasQuery = (params: SearchParams): boolean =>
  Object.values(params).some((value) =>
    typeof value === 'string' ? value.length > 0 : Array.isArray(value),
  );

export const queryRobots = (params: SearchParams): Pick<Metadata, 'robots'> =>
  hasQuery(params) ? { robots: { follow: true, index: false } } : {};
