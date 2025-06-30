import { sql } from '#sql/index';

export default {
  block: sql('queries/blocks/block.sql'),
  count: sql('queries/blocks/count.sql'),
  list: sql('queries/blocks/list.sql'),
};
