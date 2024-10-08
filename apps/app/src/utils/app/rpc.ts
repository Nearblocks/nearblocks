import { networkId } from './config';

export const RpcProviders =
  networkId === 'mainnet'
    ? [
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
          name: 'Lavender.Five',
          url: 'https://near.lavenderfive.com/',
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
