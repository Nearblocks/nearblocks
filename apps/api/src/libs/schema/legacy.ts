import { z } from 'zod';

const supply = z.object({
  format: z.enum(['coingecko']).optional(),
  unit: z.enum(['near', 'yoctonear']).optional().default('yoctonear'),
});

const fees = z.object({
  period: z.enum(['day', 'week']).optional().default('day'),
});

const nodes = z.object({
  // Every string is length-bounded: reports are stored in Redis unauthenticated.
  agent: z.object({
    build: z.string().max(64),
    name: z.string().max(64),
    version: z.string().max(32),
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
    latest_block_hash: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/),
    latest_block_height: z.number(),
    max_block_production_delay: z.number().optional(),
    max_block_wait_delay: z.number().optional(),
    min_block_production_delay: z.number().optional(),
    node_id: z.string().regex(/^ed25519:[1-9A-HJ-NP-Za-km-z]{43,44}$/),
    num_peers: z.number(),
    status: z.string().max(32),
  }),
  signature: z.string().max(128).optional(),
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
