'use client';

import { LuGlobe, LuPlus } from 'react-icons/lu';

import { usePreferences } from '@/stores/preferences';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

export const RpcSelector = () => {
  const provider = usePreferences((s) => s.provider);
  const providers = usePreferences((s) => s.providers);
  const setProvider = usePreferences((s) => s.setProvider);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-xs" variant="secondary">
          <LuGlobe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          RPC
          <Button size="icon-xs" variant="ghost">
            <LuPlus className="h-4 w-4" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {providers.map((p) => (
          <DropdownMenuCheckboxItem
            checked={p.url === provider?.url}
            key={p.url}
            onClick={() => setProvider(p)}
          >
            {p.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
