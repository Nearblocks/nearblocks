import { useState } from 'react';

import { Network } from 'nb-types';

import { MenuButton, MenuLink, MenuTitle } from '@/components/Menu';
import { getProviders } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';

import CopyButton from '../CopyButton';
import Add from '../Icons/Add';
import Close from '../Icons/Close';
interface RpcModalProps {
  isOpen: boolean;
  onAdd: () => void;
  onClose: () => void;
  rpcName: string;
  rpcUrl: string;
  setRpcName: (name: string) => void;
  setRpcUrl: (url: string) => void;
}

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
  const setRpc = useRpcStore((state) => state.setRpc);
  const network = useNetworkStore((state) => state.network);
  const setNetwork = useNetworkStore((state) => state.setNetwork);

  const setMainnet = () => {
    setNetwork(Network.MAINNET);
    setRpc(getProviders(Network.MAINNET)?.[0]?.url);
  };

  const setTestnet = () => {
    setNetwork(Network.TESTNET);
    setRpc(getProviders(Network.TESTNET)?.[0]?.url);
  };

  return (
    <>
      <MenuTitle>Network</MenuTitle>
      <MenuButton checked={network === Network.MAINNET} onClick={setMainnet}>
        Mainnet
      </MenuButton>
      <MenuButton checked={network === Network.TESTNET} onClick={setTestnet}>
        Testnet
      </MenuButton>
    </>
  );
};

export const RpcMenu = ({
  setShowModal,
}: {
  setShowModal: (value: boolean) => void;
}) => {
  const { getCustomRpc, removeRpc } = useNetworkStore();
  const customRpc = getCustomRpc();
  const providers = useNetworkStore((state) => state.providers);
  const rpcUrl = useRpcStore((state) => state.rpc);
  const setRpc = useRpcStore((state) => state.setRpc);

  const allProviders = [...providers, ...customRpc];

  return (
    <>
      <MenuTitle className="flex justify-between items-center">
        <span>RPC</span>
        <button
          className="flex justify-center items-center"
          onClick={() => setShowModal(true)}
        >
          <Add className="w-3" />
        </button>
      </MenuTitle>
      {allProviders.map((provider) => (
        <div className="flex items-center justify-between" key={provider.url}>
          <MenuButton
            checked={rpcUrl === provider.url}
            onClick={() => setRpc(provider.url)}
          >
            {provider.name}
          </MenuButton>
          {customRpc.some((p) => p.url === provider.url) && (
            <div className="flex items-center justify-between">
              <CopyButton
                buttonClassName="mx-2"
                className="text-primary w-3"
                url={provider.url}
              />
              <button
                className="mr-2 px-2 text-red rounded"
                onClick={() => removeRpc(provider.url)}
              >
                <Close className="w-3 text-red" />
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export const RpcModal: React.FC<RpcModalProps> = ({
  isOpen,
  onAdd,
  onClose,
  rpcName,
  rpcUrl,
  setRpcName,
  setRpcUrl,
}) => {
  const [urlError, setUrlError] = useState('');
  const { addRpc, getCustomRpc } = useNetworkStore();
  const providers = useNetworkStore((state) => state.providers);

  const customRpc = getCustomRpc();

  const handleAdd = () => {
    const allProviders = [...providers, ...customRpc];

    const urlExists = allProviders.some((provider) => provider.url === rpcUrl);

    if (urlExists) {
      setUrlError('This URL already exists.');
    } else {
      setUrlError('');
      addRpc({ name: rpcName, url: rpcUrl });
      onAdd();
    }
  };

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
      setRpcName('');
      setRpcUrl('');
      setUrlError('');
    }
  };

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRpcName(e.target.value);
  };

  const changeRpcUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRpcUrl(e.target.value);
    setUrlError('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 inset-0 !mt-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-bg-box p-6 lg:w-1/4 md:w-1/2 rounded-lg shadow  font-light text-text-body">
        <h2 className="font-heading font-bold text-base mb-2">
          Add Custom RPC
        </h2>
        <hr className="h-px border-0 border-b border-primary/20 mb-2" />
        <div className="mb-4">
          <label className="block text-sm font-medium">RPC Name</label>
          <input
            className="mt-1 block w-full px-3 py-2 border border-primary/20 rounded-md shadow-sm focus:outline-none fsm:text-sm bg-transparent"
            onChange={changeName}
            type="text"
            value={rpcName}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">RPC URL</label>
          <input
            className="mt-1 block w-full px-3 py-2 border border-primary/20 rounded-md shadow-sm focus:outline-none sm:text-sm bg-transparent"
            onChange={changeRpcUrl}
            type="text"
            value={rpcUrl}
          />
          {urlError && <p className="text-red text-sm">{urlError}</p>}
        </div>
        <div className="flex justify-end">
          <button
            className="mr-4 px-4 py-2 bg-bg-key-delete text-black rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-bg-key-add text-black rounded-lg"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
