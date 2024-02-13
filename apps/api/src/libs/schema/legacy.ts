import { z } from 'zod';

const supply = z.object({
  unit: z.enum(['near', 'yoctonear']).optional().default('yoctonear'),
});

const fees = z.object({
  period: z.enum(['day', 'week']).optional().default('day'),
});

export type Supply = z.infer<typeof supply>;
export type Fees = z.infer<typeof fees>;

export default {
  fees,
  supply,
};
