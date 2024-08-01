import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';

import { Menu, MenuDropdown, MenuItem } from '@/components/Menu';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';
import { useThemeStore } from '@/stores/theme';

import CaretDown from '../Icons/CaretDown';
import Dark from '../Icons/Dark';
import Light from '../Icons/Light';
import Logo from '../Icons/Logo';
import Network from '../Icons/Network';
import Rpc from '../Icons/Rpc';
import SearchIcon from '../Icons/Search';
import Settings from '../Icons/Settings';
import { NetworkMenu, RpcModal } from './Menu';
import Search from './Search';

type NavbarProps = {
  hideSearch?: boolean;
};

const RpcMenu = dynamic(
  () => import('@/components/Header/Menu').then((mod) => mod.RpcMenu),
  { ssr: false },
);

const Navbar = ({ hideSearch }: NavbarProps) => {
  const theme = useThemeStore((store) => store.theme);
  const [showMenu, setMenu] = useState(false);
  const [showSearch, setSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newRpcName, setNewRpcName] = useState('');
  const [newRpcUrl, setNewRpcUrl] = useState('');
  const setRpc = useRpcStore((state) => state.setRpc);
  const addRpc = useNetworkStore((state) => state.addRpc);

  const toggleTheme = () => {
    localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
  };
  const toggleMenu = () => setMenu((show) => !show);
  const toggleSearch = () => setSearch((show) => !show);

  const handleAddRpc = () => {
    if (newRpcName && newRpcUrl) {
      const newProvider = { name: newRpcName, url: newRpcUrl };
      addRpc(newProvider);
      setRpc(newRpcUrl);
      setNewRpcName('');
      setNewRpcUrl('');
      setShowModal(false);
    }
  };

  return (
    <div
      className={`container mx-auto font-sans font-light text-text-box relative z-20 ${
        !hideSearch && 'bg-bg-box shadow lg:rounded-xl'
      }`}
    >
      <div className="flex items-center px-4 py-6 sm:px-6">
        <div className="sm:mr-10">
          <Link href="/">
            <Logo className="h-9" />
          </Link>
        </div>
        {!hideSearch && (
          <div className="border-x w-full hidden md:flex border-border-body">
            <Search dropdownClassName="mt-[26px] rounded-b-lg" />
          </div>
        )}

        <div className="h-10 flex items-center ml-auto sm:pl-5">
          <Menu className="flex space-x-2">
            <MenuItem
              className="hidden md:inline-flex"
              dropdown={
                <MenuDropdown className="bg-bg-box rounded-b-lg shadow mt-[26px] min-w-28">
                  <NetworkMenu />
                </MenuDropdown>
              }
              trigger={
                <>
                  <Network className="h-5" />
                  <CaretDown className="h-3" />
                </>
              }
            />
            <MenuItem
              className="hidden md:inline-flex"
              dropdown={
                <MenuDropdown className="bg-bg-box rounded-b-lg shadow mt-[26px] min-w-28">
                  <RpcMenu setShowModal={setShowModal} />
                </MenuDropdown>
              }
              trigger={
                <>
                  <Rpc className="h-5" />
                  <CaretDown className="h-3" />
                </>
              }
            />
            {!hideSearch && (
              <MenuItem
                className="inline-flex md:hidden"
                onClick={toggleSearch}
                trigger={<SearchIcon className="h-5" />}
              />
            )}
            <MenuItem
              onClick={toggleTheme}
              trigger={
                theme === 'light' ? (
                  <Light className="h-5" />
                ) : (
                  <Dark className="h-5" />
                )
              }
            />
            <MenuItem
              className="inline-flex md:hidden"
              onClick={toggleMenu}
              trigger={<Settings className="h-5" />}
            />
          </Menu>
        </div>
      </div>
      {showSearch && !hideSearch && (
        <div className="absolute right-0 left-0 z-20 bg-bg-box md:hidden border-b border-border-body shadow-sm">
          <Search className="py-4 border-t border-border-body" />
        </div>
      )}
      {showMenu && (
        <div className="absolute right-0 left-0 z-20 bg-bg-box md:hidden border-b border-border-body shadow-sm">
          <div className="container mx-auto">
            <ul className="whitespace-nowrap text-sm pb-4 space-y-4">
              <NetworkMenu />
              <RpcMenu setShowModal={setShowModal} />
            </ul>
          </div>
        </div>
      )}
      <RpcModal
        isOpen={showModal}
        onAdd={handleAddRpc}
        onClose={() => setShowModal(false)}
        rpcName={newRpcName}
        rpcUrl={newRpcUrl}
        setRpcName={setNewRpcName}
        setRpcUrl={setNewRpcUrl}
      />
    </div>
  );
};

export default Navbar;
