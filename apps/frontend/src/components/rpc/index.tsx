'use client';

import { Globe, Plus } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';
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
  const provider = useSettings((s) => s.provider);
  const providers = useSettings((s) => s.providers);
  const setProvider = useSettings((s) => s.setProvider);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-xs" variant="secondary">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          RPC
          <Button size="icon-xs" variant="ghost">
            <Plus className="h-4 w-4" />
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
