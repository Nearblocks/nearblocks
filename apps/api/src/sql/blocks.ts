import { sql } from '#sql/index';

export default {
  block: sql('queries/blocks/block.sql'),
  blocks: sql('queries/blocks/blocks.sql'),
  countCagg: sql('queries/blocks/countCagg.sql'),
  stats: sql('queries/blocks/stats.sql'),
};
