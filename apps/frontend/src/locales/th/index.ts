import type { BaseDictionary } from '@/types/types';

import { about } from './about';
import { address } from './address';
import { advertise } from './advertise';
import { apis } from './apis';
import { blocks } from './blocks';
import { charts } from './charts';
import { contact } from './contact';
import { fts } from './fts';
import { home } from './home';
import { layout } from './layout';
import { nfts } from './nfts';
import { txns } from './txns';
import { validators } from './validators';

export const dictionary = {
  about,
  address,
  advertise,
  apis,
  blocks,
  charts,
  contact,
  fts,
  home,
  layout,
  nfts,
  txns,
  validators,
} satisfies BaseDictionary;
