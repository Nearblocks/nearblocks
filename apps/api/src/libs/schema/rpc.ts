import { z } from 'zod';

import { RPC_METHODS } from '#libs/rpc';

// JSON-RPC 2.0 request body accepted by the proxy. `method` is constrained to
// the allowlist; `params` is forwarded opaquely. Unknown top-level keys are
// stripped by zod, but the service forwards the original req.body verbatim.
const rpc = z.object({
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  jsonrpc: z.string().optional(),
  method: z.enum(RPC_METHODS),
  params: z.any(),
});

export type Rpc = z.infer<typeof rpc>;

// Phase 2: POST /v1/rpc/session body — a Cloudflare Turnstile token.
const session = z.object({
  token: z.string().min(1),
});

export type Session = z.infer<typeof session>;

export default { rpc, session };
