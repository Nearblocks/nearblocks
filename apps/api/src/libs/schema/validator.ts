import { z } from 'zod';

const list = z.object({
  page: z.number().positive().max(200).optional().default(1),
  per_page: z.number().positive().max(25).optional().default(25),
});

const telemetry = z.object({
  validator: z.string(),
});

export type Telemetry = z.infer<typeof telemetry>;
export type List = z.infer<typeof list>;

export default { list, telemetry };
