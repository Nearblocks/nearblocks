import { z } from 'zod';

const balance = z.object({
  account: z.string(),
});

export type Balance = z.infer<typeof balance>;

export default {
  balance,
};
