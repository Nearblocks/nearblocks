import { Network } from 'nb-types';

import { MenuButton, MenuLink, MenuTitle } from '@/components/Menu';
import config from '@/config';
import { providers } from '@/libs/rpc';
import { useRpcStore } from '@/stores/rpc';

export const LanguageMenu = () => {
  return (
    <>
      <MenuTitle>Language</MenuTitle>
      <MenuLink checked href="mainnet">
        English
      </MenuLink>
    </>
  );
};

export const NetworkMenu = () => {
  return (
    <>
      <MenuTitle>Network</MenuTitle>
      <MenuLink
        checked={config.network === Network.MAINNET}
        href={config.mainnetUrl || '/'}
      >
        Mainnet
      </MenuLink>
      <MenuLink
        checked={config.network === Network.TESTNET}
        href={config.testnetUrl || '/'}
      >
        Testnet
      </MenuLink>
    </>
  );
};

export const RpcMenu = () => {
  const rpcUrl = useRpcStore((state) => state.rpc);
  const setRpc = useRpcStore((state) => state.setRpc);

  return (
    <>
      <MenuTitle>RPC</MenuTitle>
      {providers.map((provider) => (
        <MenuButton
          checked={rpcUrl === provider.url}
          key={provider.url}
          onClick={() => setRpc(provider.url)}
        >
          {provider.name}
        </MenuButton>
      ))}
    </>
  );
};
