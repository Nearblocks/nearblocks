import { sql } from '#sql/index';

export default {
  block: sql('queries/blocks/block.sql'),
  blocks: sql('queries/blocks/blocks.sql'),
  estimate: sql('queries/blocks/estimate.sql'),
};
