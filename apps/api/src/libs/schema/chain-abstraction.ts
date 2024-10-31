import { z } from 'zod';

const multiChainAccounts = z.object({
  account: z.string(),
});

export type MultiChainAccounts = z.infer<typeof multiChainAccounts>;

export default {
  multiChainAccounts,
};
