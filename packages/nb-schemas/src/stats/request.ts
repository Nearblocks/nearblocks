import * as v from 'valibot';

import { limitSchemaMax } from '../common.js';

const daily = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: limitSchemaMax(365),
});

export type DailyStatsReq = v.InferOutput<typeof daily>;

export default { daily };
