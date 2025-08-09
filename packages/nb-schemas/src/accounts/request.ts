import * as v from 'valibot';

const account = v.object({
  account: v.string(),
});

export type AccountReq = v.InferOutput<typeof account>;

export default { account };
