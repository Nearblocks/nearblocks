import { z } from 'zod';

const accountId = z
  .string()
  .min(2)
  .max(64)
  .regex(/^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/i)
  .transform((value) => value.toLowerCase());

const telemetry = z.object({
  agent: z.object({
    build: z.string(),
    name: z.string(),
    version: z.string(),
  }),
  chain: z.object({
    account_id: accountId.nullish(),
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

export type NodeTelemetry = z.infer<typeof telemetry>;

export default { telemetry };
