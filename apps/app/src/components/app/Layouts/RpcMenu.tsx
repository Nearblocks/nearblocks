'use client';

import { useEffect, useState } from 'react';
import Check from '@/components/app/Icons/Check';
import Rpc from '@/components/app/Icons/Rpc';
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useRpcProvider } from '@/components/app/common/RpcContext';

const RpcMenu = ({ positionClass }: { positionClass?: string }) => {
  const [isClient, setIsClient] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { rpc: rpcUrl, setRpc, providers: RpcProviders } = useRpcProvider();

  const handleSelect = (url: string) => {
    setRpc(url);
  };

  return (
    <div className="relative group flex">
      <PopoverRoot
        positioning={{ sameWidth: true }}
        onOpenChange={() => setIsPopoverOpen((prev) => !prev)}
      >
        <PopoverTrigger
          asChild
          className="md:flex justify-center w-full hover:text-green-500 dark:hover:text-green-250 text-nearblue-600 dark:text-neargray-10 hover:no-underline px-0 py-1 "
        >
          <button
            className={`border px-2.5 py-1.5 cursor-pointer focus:outline-none flex items-center rounded-md text-nearblue-600 dark:text-neargray-10 dark:border-gray-800 ${
              isPopoverOpen
                ? 'bg-gray-100 dark:bg-black-200'
                : 'bg-white dark:bg-black-600 hover:bg-gray-100 dark:hover:bg-black-200'
            }`}
          >
            <Rpc className="h-4 w-4 dark:text-neargray-10" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={`bg-white w-44 -mt-1 md:left-auto rounded-md soft-shadow border z-10 dark:border-gray-800 dark:bg-black overflow-visible ${
            positionClass ? positionClass : 'md:right-0'
          } `}
          style={{
            position: 'absolute',
            transform: 'translateX(0)',
          }}
        >
          {isClient && (
            <ul className="p-0.5">
              {RpcProviders.map((provider) => (
                <li
                  className={`flex justify-between items-center text-xs px-4 py-2 m-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-black-200 hover:text-green-400 dark:hover:text-green-250 text-nearblue-600 dark:text-neargray-10 rounded-md ${
                    provider.url === rpcUrl
                      ? 'bg-gray-100 dark:bg-black-200 text-green-500 dark:!text-green-250'
                      : ''
                  }`}
                  key={provider.url}
                  onClick={() => handleSelect(provider.url)}
                >
                  <span>{provider.name}</span>
                  {provider.url === rpcUrl && (
                    <Check className="w-3 mr-2 text-green-500 dark:text-green-250" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
};

export default RpcMenu;
