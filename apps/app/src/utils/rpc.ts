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
          name: 'fast-near web4',
          url: 'https://rpc.web4.near.page',
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
        {
          name: 'OMNIA',
          url: 'https://endpoints.omniatech.io/v1/near/mainnet/public',
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
        {
          name: 'NEAR (Beta)',
          url: 'https://beta.rpc.testnet.near.org',
        },
      ];
