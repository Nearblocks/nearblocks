import * as z from 'zod/v4/mini';

import { ONetwork } from '@/types/enums';

export const serverEnvSchema = z.object({
  API_ACCESS_KEY: z.string(),
  API_URL: z.url(),
  AWS_REGION: z.string(),
  AWS_SES_FROM_EMAIL: z.email(),
  AWS_SES_TO_EMAIL: z.email(),
  RPC_UPSTREAM_ARCHIVAL_URL: z.optional(z.url()),
  RPC_UPSTREAM_KEY: z.optional(z.string()),
  RPC_UPSTREAM_URL: z.url(),
  TURNSTILE_SECRET_KEY: z.string(),
});

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_LEGACY_UI_URL: z.optional(z.url()),
  NEXT_PUBLIC_MAINNET_URL: z._default(z.url(), 'https://nearblocks.io'),
  NEXT_PUBLIC_NETWORK_ID: z.enum(ONetwork),
  NEXT_PUBLIC_REOWN_PROJECT_ID: z.string(),
  NEXT_PUBLIC_TESTNET_URL: z._default(z.url(), 'https://testnet.nearblocks.io'),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string(),
});

export const defaultTheme = 'dark';

// Free, anonymous, CORS-open providers only. The near.org endpoints were
// deprecated in 2025 and now just alias FastNear's infrastructure; FastNear's
// keyed endpoint duplicates the free one for anonymous use. dRPC is not
// archival — queries for garbage-collected blocks fall back to other providers.
export const rpcProviders = () => ({
  mainnet: [
    {
      name: 'FastNear',
      url: 'https://free.rpc.fastnear.com',
    },
    {
      name: 'FastNear (Archival)',
      url: 'https://archival-rpc.mainnet.fastnear.com',
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
      url: 'https://test.rpc.fastnear.com',
    },
    {
      name: 'FastNear (Archival)',
      url: 'https://archival-rpc.testnet.fastnear.com',
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

const contractVerifier = {
  mainnet: {
    api: {
      list: 'https://api.sourcescan.dev/api/ipfs/structure',
      verify: 'https://api-v2.sourcescan.dev/api/verify/rust',
    },
    contract: 'v2-verifier.sourcescan.near',
    ipfs: 'https://api.sourcescan.dev/ipfs',
  },
  testnet: {
    api: {
      list: 'https://api.sourcescan.dev/api/ipfs/structure',
      verify: 'https://api-v2.sourcescan.dev/api/verify/rust',
    },
    contract: 'v2-verifier.sourcescan.testnet',
    ipfs: 'https://api.sourcescan.dev/ipfs',
  },
} as const;

export const envSchema = z.object({
  ...serverEnvSchema.shape,
  ...publicEnvSchema.shape,
});

const providerSchema = z.object({
  name: z.string(),
  url: z.url(),
});

const verifierSchema = z.object({
  api: z.object({
    list: z.url(),
    verify: z.url(),
  }),
  contract: z.string(),
  ipfs: z.url(),
});

const configSchema = z.object({
  legacyUiUrl: publicEnvSchema.shape.NEXT_PUBLIC_LEGACY_UI_URL,
  mainnetUrl: publicEnvSchema.shape.NEXT_PUBLIC_MAINNET_URL,
  metaTemplate: z.string(),
  network: publicEnvSchema.shape.NEXT_PUBLIC_NETWORK_ID,
  provider: providerSchema,
  providers: z.array(providerSchema),
  reownProjectId: publicEnvSchema.shape.NEXT_PUBLIC_REOWN_PROJECT_ID,
  siteUrl: z.string(),
  testnetUrl: publicEnvSchema.shape.NEXT_PUBLIC_TESTNET_URL,
  turnstileSiteKey: publicEnvSchema.shape.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  verifier: verifierSchema,
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

export const getRuntimeConfig = (): Config => {
  if (!cachedPublicConfig) {
    cachedPublicConfig = publicEnvSchema.parse({
      NEXT_PUBLIC_LEGACY_UI_URL: process.env.NEXT_PUBLIC_LEGACY_UI_URL,
      NEXT_PUBLIC_MAINNET_URL: process.env.NEXT_PUBLIC_MAINNET_URL,
      NEXT_PUBLIC_NETWORK_ID: process.env.NEXT_PUBLIC_NETWORK_ID,
      NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
      NEXT_PUBLIC_TESTNET_URL: process.env.NEXT_PUBLIC_TESTNET_URL,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY:
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    });
  }

  const network = cachedPublicConfig.NEXT_PUBLIC_NETWORK_ID;
  const mainnetUrl = cachedPublicConfig.NEXT_PUBLIC_MAINNET_URL;
  const testnetUrl = cachedPublicConfig.NEXT_PUBLIC_TESTNET_URL;
  const providers = [
    { name: 'NearBlocks', url: '/api/rpc' },
    ...rpcProviders()[network],
  ];
  const siteUrl = network === 'mainnet' ? mainnetUrl : testnetUrl;
  const metaTemplate =
    network === 'mainnet' ? '%s | NearBlocks' : 'TESTNET | %s | NearBlocks';

  return {
    legacyUiUrl: cachedPublicConfig.NEXT_PUBLIC_LEGACY_UI_URL,
    mainnetUrl,
    metaTemplate,
    network,
    provider: providers[0],
    providers,
    reownProjectId: cachedPublicConfig.NEXT_PUBLIC_REOWN_PROJECT_ID,
    siteUrl,
    testnetUrl,
    turnstileSiteKey: cachedPublicConfig.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    verifier: contractVerifier[network],
  };
};
