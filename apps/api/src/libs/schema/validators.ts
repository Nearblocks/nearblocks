import { z } from 'zod';

import { rpcProviders } from '#libs/near';

const list = z.object({
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(250).optional().default(25),
  rpc: z.enum(rpcProviders).optional(),
});

export type List = z.infer<typeof list>;

export default { list };
