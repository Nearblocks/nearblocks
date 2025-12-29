import * as v from 'valibot';

const search = v.object({
  keyword: v.string(),
});

export type SearchReq = v.InferOutput<typeof search>;

export default { search };
