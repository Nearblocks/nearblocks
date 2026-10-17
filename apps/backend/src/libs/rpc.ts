import config from '#config';
import { CountedAxiosRpc, CountedRpcClient } from '#libs/rpcClients';
import { recordRpcCall } from '#libs/rpcCounter';

const rpcEndpoints = config.rpcUrls.map((url, index) => ({
  authToken: config.rpcAuthTokens[index],
  url,
}));

export const rpc = new CountedRpcClient(rpcEndpoints, {
  recordCall: recordRpcCall,
});

export const axiosRpc = new CountedAxiosRpc(rpcEndpoints, {
  recordCall: recordRpcCall,
});

// The metadata backfill job has its own explicitly configured archival RPC.
export const archivalRpc = new CountedAxiosRpc(
  [{ authToken: '', url: config.archivalRpcUrl }],
  { recordCall: recordRpcCall },
);
