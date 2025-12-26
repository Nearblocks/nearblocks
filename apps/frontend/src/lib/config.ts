import * as z from 'zod/mini';

import { ONetwork, OTheme } from '@/types/enums';

export const serverEnvSchema = z.object({
  API_ACCESS_KEY: z.string(),
  API_URL: z.string(),
});

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string(),
  NEXT_PUBLIC_FASTNEAR_RPC_KEY: z.string(),
  NEXT_PUBLIC_MAINNET_URL: z._default(z.string(), 'https://nearblocks.io'),
  NEXT_PUBLIC_NETWORK_ID: z.enum(ONetwork),
  NEXT_PUBLIC_REOWN_PROJECT_ID: z.string(),
  NEXT_PUBLIC_TESTNET_URL: z._default(
    z.string(),
    'https://testnet.nearblocks.io',
  ),
});

export const providers = {
  mainnet: [
    {
      name: 'Fastnear',
      url: 'https://mainnet.fastnear.io',
    },
  ],
  testnet: [
    {
      name: 'Fastnear',
      url: 'https://testnet.fastnear.io',
    },
  ],
};

export const envSchema = z.object({
  ...serverEnvSchema.shape,
  ...publicEnvSchema.shape,
});

const configSchema = z.object({
  ...publicEnvSchema.shape,
  providers: z.object({
    mainnet: z.array(z.object({ name: z.string(), url: z.url() })),
    testnet: z.array(z.object({ name: z.string(), url: z.url() })),
  }),
  theme: z.enum(OTheme),
});

export type Config = z.infer<typeof configSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const getServerConfig = (): ServerEnv => {
  return serverEnvSchema.parse({ ...process.env });
};

export const getRuntimeConfig = (theme: string): Config => {
  return configSchema.parse({ ...process.env, providers, theme });
};
