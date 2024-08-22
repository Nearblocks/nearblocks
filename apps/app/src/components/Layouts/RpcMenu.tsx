import { useRpcStore } from '@/stores/rpc';
import { MenuButton, MenuTitle } from './Menu';
import { RpcProviders } from '@/utils/rpc';

const RpcMenu = () => {
  const rpcUrl = useRpcStore((state) => state.rpc);
  const setRpc = useRpcStore((state) => state.setRpc);

  return (
    <>
      <MenuTitle>RPC</MenuTitle>
      {RpcProviders.map((provider) => (
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

export default RpcMenu;
