import * as z from 'zod/v4/mini';

import { emptyUrlsAsUnset, envSchema } from '@/lib/config';

export const register = async () => {
  const result = envSchema.safeParse(emptyUrlsAsUnset(process.env));

  if (!result.success) {
    const pretty = z.prettifyError(result.error);
    throw pretty;
  }
};
