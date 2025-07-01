import { useConfig } from './useConfig';

export const useRpcProvider = () => {
  const { networkId, rpcKey } = useConfig();
  const RpcProviders =
    networkId === 'mainnet'
      ? [
          {
            name: 'FastNEAR (Archival)',
            url: `https://rpc.mainnet.fastnear.com?apiKey=${rpcKey}`,
          },
          {
            name: 'NEAR (Archival)',
            url: 'https://archival-rpc.mainnet.near.org',
          },
          {
            name: 'NEAR',
            url: 'https://rpc.mainnet.near.org',
          },
          {
            name: 'NEAR (Beta)',
            url: 'https://beta.rpc.mainnet.near.org',
          },
          {
            name: 'FASTNEAR Free',
            url: 'https://free.rpc.fastnear.com',
          },
          {
            name: 'Lava Network',
            url: 'https://near.lava.build',
          },
          {
            name: 'dRPC',
            url: 'https://near.drpc.org',
          },
        ]
      : [
          {
            name: 'NEAR (Archival)',
            url: 'https://archival-rpc.testnet.near.org',
          },
          {
            name: 'NEAR',
            url: 'https://rpc.testnet.near.org',
          },
        ];
  return {
    RpcProviders,
  };
};
