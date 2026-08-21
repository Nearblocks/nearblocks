import 'knex/types/tables';

import { TTables } from 'nb-types';

declare module 'knex/types/tables.js' {
  interface Tables extends TTables {}
}
