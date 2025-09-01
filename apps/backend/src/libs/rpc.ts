import { NearRpcClient } from '@near-js/jsonrpc-client/no-validation';

import config from '#config';

export const rpc = new NearRpcClient({
  endpoint: config.rpcUrl,
});
