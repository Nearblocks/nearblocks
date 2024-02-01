import { z } from 'zod';

const supply = z.object({
  unit: z.enum(['near', 'yoctonear']).optional().default('yoctonear'),
});

export type Supply = z.infer<typeof supply>;

export default {
  supply,
};
