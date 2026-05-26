import { sql } from '#sql/index';

export default {
  info: sql('queries/validators/info.sql'),
  list: sql('queries/validators/list.sql'),
};
