import * as z from 'zod/mini';

import { ONetwork, OTheme, Theme } from '@/types/enums';

export const serverEnvSchema = z.object({
  API_ACCESS_KEY: z.string(),
  API_URL: z.url(),
  NEXT_PUBLIC_FASTNEAR_RPC_KEY: z.string(),
});

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_FASTNEAR_RPC_KEY: z.string(),
  NEXT_PUBLIC_MAINNET_URL: z._default(z.url(), 'https://nearblocks.io'),
  NEXT_PUBLIC_NETWORK_ID: z.enum(ONetwork),
  NEXT_PUBLIC_REOWN_PROJECT_ID: z.string(),
  NEXT_PUBLIC_TESTNET_URL: z._default(z.url(), 'https://testnet.nearblocks.io'),
});

export const rpcProviders = (key: string) => ({
  mainnet: [
    {
      name: 'FastNear',
      url: `https://mainnet.fastnear.io?apiKey=${key}`,
    },
    {
      name: 'FastNear (Archival)',
      url: `https://archival-rpc.mainnet.fastnear.com/?apiKey=${key}`,
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
      name: 'FastNear Free',
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
  ],
  testnet: [
    {
      name: 'FastNear',
      url: `https://testnet.fastnear.io?apiKey=${key}`,
    },
    {
      name: 'FastNear (Archival)',
      url: `https://archival-rpc.testnet.fastnear.com/?apiKey=${key}`,
    },
    {
      name: 'NEAR (Archival)',
      url: 'https://archival-rpc.testnet.near.org',
    },
    {
      name: 'NEAR',
      url: 'https://rpc.testnet.near.org',
    },
    {
      name: 'FastNear Free',
      url: 'https://test.rpc.fastnear.com',
    },
    {
      name: 'Lava Network',
      url: 'https://neart.lava.build',
    },
    {
      name: 'dRPC',
      url: 'https://near-testnet.drpc.org',
    },
  ],
});

export const envSchema = z.object({
  ...serverEnvSchema.shape,
  ...publicEnvSchema.shape,
});

const providerSchema = z.object({
  name: z.string(),
  url: z.url(),
});

const configSchema = z.object({
  fastNearRpcKey: publicEnvSchema.shape.NEXT_PUBLIC_FASTNEAR_RPC_KEY,
  mainnetUrl: publicEnvSchema.shape.NEXT_PUBLIC_MAINNET_URL,
  networkId: publicEnvSchema.shape.NEXT_PUBLIC_NETWORK_ID,
  provider: providerSchema,
  providers: z.array(providerSchema),
  reownProjectId: publicEnvSchema.shape.NEXT_PUBLIC_REOWN_PROJECT_ID,
  testnetUrl: publicEnvSchema.shape.NEXT_PUBLIC_TESTNET_URL,
  theme: z.enum(OTheme),
});

export type Config = z.infer<typeof configSchema>;
export type EnvSchema = z.infer<typeof envSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServerConfig: null | ServerEnv = null;

export const getServerConfig = (): ServerEnv => {
  if (!cachedServerConfig) {
    cachedServerConfig = serverEnvSchema.parse({ ...process.env });
  }

  return cachedServerConfig;
};

let cachedPublicConfig: null | PublicEnv = null;

export const getRuntimeConfig = (theme: Theme): Config => {
  if (!cachedPublicConfig) {
    cachedPublicConfig = publicEnvSchema.parse({
      NEXT_PUBLIC_FASTNEAR_RPC_KEY: process.env.NEXT_PUBLIC_FASTNEAR_RPC_KEY,
      NEXT_PUBLIC_MAINNET_URL: process.env.NEXT_PUBLIC_MAINNET_URL,
      NEXT_PUBLIC_NETWORK_ID: process.env.NEXT_PUBLIC_NETWORK_ID,
      NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
      NEXT_PUBLIC_TESTNET_URL: process.env.NEXT_PUBLIC_TESTNET_URL,
    });
  }

  const providers = rpcProviders(
    cachedPublicConfig.NEXT_PUBLIC_FASTNEAR_RPC_KEY,
  )[cachedPublicConfig.NEXT_PUBLIC_NETWORK_ID];

  return {
    fastNearRpcKey: cachedPublicConfig.NEXT_PUBLIC_FASTNEAR_RPC_KEY,
    mainnetUrl: cachedPublicConfig.NEXT_PUBLIC_MAINNET_URL,
    networkId: cachedPublicConfig.NEXT_PUBLIC_NETWORK_ID,
    provider: providers[0],
    providers,
    reownProjectId: cachedPublicConfig.NEXT_PUBLIC_REOWN_PROJECT_ID,
    testnetUrl: cachedPublicConfig.NEXT_PUBLIC_TESTNET_URL,
    theme,
  };
};
