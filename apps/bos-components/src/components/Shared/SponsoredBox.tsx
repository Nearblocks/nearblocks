import Trade from '@/includes/Banners/Trade';
import Earn from '@/includes/Banners/Earn';
import Store from '@/includes/Banners/Store';
import ArrowDown from '@/includes/icons/ArrowDown';
import { getConfig } from '@/includes/libs';

export default function () {
  const config = getConfig(context.networkId);

  return (
    <div className="flex items-center flex-shrink-0 max-w-full px-2 space-x-2 pt-4">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex bg-green-500  border border-green-900/10 hover:bg-green-400 text-white text-xs px-3 py-2 mb-4 rounded focus:outline-none"
            aria-label="Update dimensions"
          >
            Buy <ArrowDown className="h-4 w-4 fill-current ml-1" />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="bg-white w-60 shadow-lg border rounded-lg p-3 mt-2 slide-down"
          sideOffset={5}
        >
          <span
            className="text-xs text-gray-400 absolute right-2 top-2"
            style={{ fontSize: '10px' }}
          >
            Sponsored
          </span>
          <ul className="space-y-4 divide-y">
            <li className="pt-3">{/* <Buy /> */}</li>
          </ul>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex bg-green-500  border border-green-900/10 hover:bg-green-400 text-white text-xs px-3 py-2 mb-4 rounded focus:outline-none"
            aria-label="Update dimensions"
          >
            Trade <ArrowDown className="h-4 w-4 fill-current ml-1" />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="bg-white w-60 shadow-lg border rounded-lg p-3 mt-2 slide-down"
          sideOffset={5}
        >
          <span
            className="text-xs text-gray-400 absolute right-2 top-2"
            style={{ fontSize: '10px' }}
          >
            Sponsored
          </span>
          <ul className="space-y-4 divide-y">
            <li className="pt-3">
              <Trade appUrl={config?.appUrl} />
            </li>
          </ul>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex bg-green-500  border border-green-900/10 hover:bg-green-400 text-white text-xs px-3 py-2 mb-4 rounded focus:outline-none"
            aria-label="Update dimensions"
          >
            Earn <ArrowDown className="h-4 w-4 fill-current ml-1" />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="bg-white w-60 shadow-lg border rounded-lg p-3 mt-2 slide-down"
          sideOffset={5}
        >
          <span
            className="text-xs text-gray-400 absolute right-2 top-2"
            style={{ fontSize: '10px' }}
          >
            Sponsored
          </span>
          <ul className="space-y-4 divide-y">
            <li className="pt-3">
              <Earn appUrl={config?.appUrl} />
            </li>
          </ul>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex bg-green-500  border border-green-900/10 hover:bg-green-400 text-white text-xs px-3 py-2 mb-4 rounded focus:outline-none"
            aria-label="Update dimensions"
          >
            Store <ArrowDown className="h-4 w-4 fill-current ml-1" />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="bg-white w-60 shadow-lg border rounded-lg p-3 mt-2 slide-down"
          sideOffset={5}
        >
          <span
            className="text-xs text-gray-400 absolute right-2 top-2"
            style={{ fontSize: '10px' }}
          >
            Sponsored
          </span>
          <ul className="space-y-4 divide-y">
            <li className="pt-3">
              <Store appUrl={config?.appUrl} />
            </li>
          </ul>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
