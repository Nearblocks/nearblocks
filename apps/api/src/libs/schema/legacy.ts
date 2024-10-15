import { z } from 'zod';

const supply = z.object({
  format: z.enum(['coingecko']).optional(),
  unit: z.enum(['near', 'yoctonear']).optional().default('yoctonear'),
});

const fees = z.object({
  period: z.enum(['day', 'week']).optional().default('day'),
});

const nodes = z.object({
  agent: z.object({
    build: z.string(),
    name: z.string(),
    version: z.string(),
  }),
  chain: z.object({
    account_id: z
      .string()
      .min(2)
      .max(64)
      .regex(/^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/i)
      .transform((value) => value.toLowerCase())
      .nullish(),
    block_production_tracking_delay: z.number().optional(),
    is_validator: z.boolean(),
    latest_block_hash: z.string().min(43).max(44),
    latest_block_height: z.number(),
    max_block_production_delay: z.number().optional(),
    max_block_wait_delay: z.number().optional(),
    min_block_production_delay: z.number().optional(),
    node_id: z.string(),
    num_peers: z.number(),
    status: z.string(),
  }),
  signature: z.string().optional(),
  system: z.object({
    bandwidth_download: z.number(),
    bandwidth_upload: z.number(),
    boot_time_seconds: z.number().optional(),
    cpu_usage: z.number(),
    memory_usage: z.number(),
  }),
});

export type Supply = z.infer<typeof supply>;
export type Fees = z.infer<typeof fees>;
export type Nodes = z.infer<typeof nodes>;

export default {
  fees,
  nodes,
  supply,
};
