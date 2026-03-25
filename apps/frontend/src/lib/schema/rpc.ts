import * as z from 'zod/v4/mini';

export const rpcProviderSchema = z.object({
  name: z.string().check(z.minLength(1, 'Name is required')),
  url: z.url('Must be a valid URL'),
});

export type RpcProviderValues = z.infer<typeof rpcProviderSchema>;
