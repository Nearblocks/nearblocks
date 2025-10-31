import { sql } from '#sql/index';

export default {
  daily: sql('queries/stats/daily.sql'),
  stats: sql('queries/stats/stats.sql'),
  tps: sql('queries/stats/tps.sql'),
};
