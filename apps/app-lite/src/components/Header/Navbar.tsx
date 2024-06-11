import Link from 'next/link';
import { useState } from 'react';

import { Menu, MenuDropdown, MenuItem } from '@/components/Menu';
import { useThemeStore } from '@/stores/theme';

import CaretDown from '../Icons/CaretDown';
import Dark from '../Icons/Dark';
import Light from '../Icons/Light';
import Logo from '../Icons/Logo';
import Network from '../Icons/Network';
import Rpc from '../Icons/Rpc';
import SearchIcon from '../Icons/Search';
import Settings from '../Icons/Settings';
import { NetworkMenu, RpcMenu } from './Menu';
import Search from './Search';

const Navbar = () => {
  const theme = useThemeStore((store) => store.theme);
  const [showMenu, setMenu] = useState(false);
  const [showSearch, setSearch] = useState(false);

  const toggleTheme = () => {
    localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
  };
  const toggleMenu = () => setMenu((show) => !show);
  const toggleSearch = () => setSearch((show) => !show);

  return (
    <div className="container mx-auto bg-bg-box font-sans font-light text-text-box relative z-20 shadow lg:rounded-xl">
      <div className="flex items-center px-4 py-6 sm:px-6">
        <div className="sm:mr-10">
          <Link href="/">
            <Logo className="h-9" />
          </Link>
        </div>
        <Search
          className="hidden md:flex border-x border-border-body"
          dropdownClassName="mt-[26px] rounded-b-lg"
        />
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
                  <RpcMenu />
                </MenuDropdown>
              }
              trigger={
                <>
                  <Rpc className="h-5" />
                  <CaretDown className="h-3" />
                </>
              }
            />
            <MenuItem
              className="inline-flex md:hidden"
              onClick={toggleSearch}
              trigger={<SearchIcon className="h-5" />}
            />
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
      {showSearch && (
        <div className="absolute right-0 left-0 z-20 bg-bg-box md:hidden border-b border-border-body shadow-sm">
          <Search className="py-4 border-t border-border-body" />
        </div>
      )}
      {showMenu && (
        <div className="absolute right-0 left-0 z-20 bg-bg-box md:hidden border-b border-border-body shadow-sm">
          <div className="container mx-auto">
            <ul className="whitespace-nowrap text-sm pb-4 space-y-4">
              <NetworkMenu />
              <RpcMenu />
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
