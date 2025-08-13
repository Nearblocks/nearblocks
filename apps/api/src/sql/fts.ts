import { sql } from '#sql/index';

export default {
  events: sql('queries/fts/events.sql'),
  eventsCount: sql('queries/fts/eventsCount.sql'),
  eventTxn: sql('queries/fts/eventTxn.sql'),
};
