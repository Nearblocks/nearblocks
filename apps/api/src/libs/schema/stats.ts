import { z } from 'zod';

import dayjs from '#libs/dayjs';

const price = z.object({
  date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || dayjs(val, 'YYYY-MM-DD', true).isValid(),
      { message: 'Invalid date' },
    ),
});

export type Price = z.infer<typeof price>;

export default { price };
