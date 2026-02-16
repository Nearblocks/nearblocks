import type { BaseDictionary } from '@/types/types';

import { address } from './address';
import { home } from './home';
import { layout } from './layout';
import { txns } from './txns';

export const dictionary = {
  address,
  home,
  layout,
  txns,
} satisfies BaseDictionary;
