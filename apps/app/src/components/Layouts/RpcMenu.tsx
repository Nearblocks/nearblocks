import { useRpcStore } from '@/stores/rpc';
import { RpcProviders } from '@/utils/rpc';
import { useEffect, useRef, useState } from 'react';
import Rpc from '../Icons/Rpc';
import ArrowDown from '../Icons/ArrowDown';
import Check from '../Icons/Check';

const RpcMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (url: string) => {
    setRpc(url);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const rpcUrl = useRpcStore((state) => state.rpc);
  const setRpc = useRpcStore((state) => state.setRpc);

  return (
    <li className="relative group flex h-8 justify-end max-md:mb-2">
      <span className="border rounded-md bg-gray-100 dark:bg-black-200 text-nearblue-600 dark:text-neargray-10 hover:text-green-500 dark:hover:text-green-250 ">
        <div className="absolute max-md:hidden left-2.5 top-2 md:flex items-center pointer-events-none">
          <Rpc className="h-3.5 dark:filter dark:invert" />
        </div>
        <button
          className={`h-full max-md:!w-24 md:w-28 pl-3 pr-6 md:!px-7 py-1 truncate cursor-pointer focus:outline-none appearance-none`}
          onClick={toggleDropdown}
        >
          {RpcProviders.find((provider) => provider.url === rpcUrl)?.name}
        </button>
        <ArrowDown className="absolute right-2.5 top-2 w-4 h-4 fill-current pointer-events-none" />
      </span>
      <div className="absolute py-1 z-10 left-0 top-full">
        <ul className=" hidden group-hover:block  w-36 bg-white dark:bg-black-600 border border-gray-300 dark:border-black-200 rounded-md soft-shadow">
          {RpcProviders.map((provider) => (
            <li
              key={provider.url}
              className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-black-500 hover:text-green-400 dark:hover:text-green-250 dark:text-neargray-10 ${
                provider.url === rpcUrl
                  ? 'bg-gray-100 dark:bg-black-500 text-green-500 dark:!text-green-250'
                  : ''
              }`}
              onClick={() => handleSelect(provider.url)}
            >
              {' '}
              <span className="">{provider.name}</span>
              {provider.url === rpcUrl && (
                <Check className="w-3 mr-2 text-green-500 dark:text-green-250" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default RpcMenu;
