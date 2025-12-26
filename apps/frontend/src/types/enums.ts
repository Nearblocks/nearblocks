export const ONetwork = {
  mainnet: 'mainnet',
  testnet: 'testnet',
} as const;
export type Network = (typeof ONetwork)[keyof typeof ONetwork];

export const OTheme = {
  dark: 'dark',
  light: 'light',
} as const;
export type Theme = (typeof OTheme)[keyof typeof OTheme];
