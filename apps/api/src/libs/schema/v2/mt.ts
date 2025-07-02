import { z } from 'zod';

export const MTTokenIds = z.object({
  token_ids: z.array(z.string()).nonempty(),
});
export type MTTokenIdsType = z.infer<typeof MTTokenIds>;

export const schema = {
  mt: MTTokenIds,
};
