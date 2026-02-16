'use client';

import { createContext } from 'react';
import type { PropsWithChildren } from 'react';

import { Config } from '@/lib/config';
import { ConfigStore, createConfigStore } from '@/stores/config';
import { createSettingsStore, SettingsStore } from '@/stores/settings';
import { createWalletStore, WalletStore } from '@/stores/wallet';

type Props = PropsWithChildren<{
  config: Config;
}>;

export const ConfigContext = createContext<ConfigStore | null>(null);
export const SettingsContext = createContext<null | SettingsStore>(null);
export const WalletContext = createContext<null | WalletStore>(null);

import { useState } from 'react';

export const ConfigProvider = ({ children, config }: Props) => {
  const [configStore] = useState(() => createConfigStore(config));
  const [settingsStore] = useState(() =>
    createSettingsStore(config.networkId, config.provider),
  );
  const [walletStore] = useState(() =>
    createWalletStore({
      mainnetUrl: config.mainnetUrl,
      network: config.networkId,
      projectId: config.reownProjectId,
      providers: config.providers,
      testnetUrl: config.testnetUrl,
    }),
  );

  return (
    <ConfigContext.Provider value={configStore}>
      <SettingsContext.Provider value={settingsStore}>
        <WalletContext.Provider value={walletStore}>
          {children}
        </WalletContext.Provider>
      </SettingsContext.Provider>
    </ConfigContext.Provider>
  );
};
