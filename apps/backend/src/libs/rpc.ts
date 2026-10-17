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
