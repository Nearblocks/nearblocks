import { sql } from '#sql/index';

export default {
  detail: sql('queries/validators/detail.sql'),
  info: sql('queries/validators/info.sql'),
  list: sql('queries/validators/list.sql'),
  stats: {
    blocks: sql('queries/validators/stats/blocks.sql'),
    chunks: sql('queries/validators/stats/chunks.sql'),
  },
};
