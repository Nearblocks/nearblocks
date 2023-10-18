import 'knex/types/tables';
import { BalanceEvent, Setting } from '#ts/types';

declare module 'knex/types/tables.js' {
  interface Tables {
    balance_events: BalanceEvent;
    settings: Setting;
  }
}
