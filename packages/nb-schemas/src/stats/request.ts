import * as v from 'valibot';

const daily = v.object({
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(v.number()),
});

export type DailyStatsReq = v.InferOutput<typeof daily>;

export default { daily };
