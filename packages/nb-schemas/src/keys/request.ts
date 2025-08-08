import * as v from 'valibot';

const key = v.object({
  key: v.string(),
});

export type AccessKeyReq = v.InferOutput<typeof key>;

export default { key };
