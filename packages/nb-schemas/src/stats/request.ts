import * as v from 'valibot';

import { statsLimitSchema } from '../common.js';

const daily = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: statsLimitSchema,
});

export type DailyStatsReq = v.InferOutput<typeof daily>;

export default { daily };
