import { sql } from '#sql/index';

export default {
  daily: sql('queries/stats/daily.sql'),
  signer: sql('queries/stats/signer.sql'),
  stats: sql('queries/stats/stats.sql'),
  tps: sql('queries/stats/tps.sql'),
};
