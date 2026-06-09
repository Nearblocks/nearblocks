// Shared helpers for the keyless JSON-RPC proxy (routes/rpc.ts).
// Single source of truth for the method allowlist and the JSON-RPC error shape
// so the schema, the validator middleware and the forwarding service agree.

// Only these read-only JSON-RPC methods may be proxied to FastNear. Anything
// else is rejected with a JSON-RPC `method not found` error. Kept as a readonly
// tuple so it can both seed a zod enum and back a Set lookup.
export const RPC_METHODS = [
  'query',
  'block',
  'chunk',
  'gas_price',
  'validators',
  'EXPERIMENTAL_protocol_config',
  'EXPERIMENTAL_tx_status',
  'tx',
  'status',
] as const;

export type RpcMethod = (typeof RPC_METHODS)[number];

const methodSet: ReadonlySet<string> = new Set(RPC_METHODS);

export const isAllowedMethod = (method: unknown): method is RpcMethod =>
  typeof method === 'string' && methodSet.has(method);

// JSON-RPC 2.0 id: a string, number or null. Requests without a parseable id
// are answered with id: null per the spec.
export type JsonRpcId = null | number | string;

export type JsonRpcError = {
  error: { code: number; message: string };
  id: JsonRpcId;
  jsonrpc: '2.0';
};

// Standard-ish JSON-RPC error codes used by the proxy guards. -32603 internal
// error, -32600 invalid request, -32601 method not found, -32000 server-defined
// (session required).
export const RPC_ERROR_CODE = {
  INTERNAL_ERROR: -32603,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  RATE_LIMITED: -32001,
  SESSION_REQUIRED: -32000,
} as const;

export const jsonRpcError = (
  id: JsonRpcId,
  code: number,
  message: string,
): JsonRpcError => ({
  error: { code, message },
  id: id ?? null,
  jsonrpc: '2.0',
});

// Best-effort extraction of a JSON-RPC id from an unvalidated request body so
// error responses can echo it back. Falls back to null on anything unexpected.
export const extractRpcId = (body: unknown): JsonRpcId => {
  if (body && typeof body === 'object' && 'id' in body) {
    const id = (body as { id: unknown }).id;

    if (typeof id === 'string' || typeof id === 'number' || id === null) {
      return id;
    }
  }

  return null;
};
