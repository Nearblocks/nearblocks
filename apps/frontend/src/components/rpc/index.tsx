'use client';

import { Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useConfig } from '@/hooks/use-config';
import { useSettings } from '@/hooks/use-settings';
import type { RpcProviderValues } from '@/lib/schema/rpc';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

import { RpcProviderForm } from './form';

type DialogState = { mode: 'add' } | { mode: 'edit'; url: string } | null;

export const RpcSelector = () => {
  const defaultProviders = useConfig((s) => s.config.providers);
  const provider = useSettings((s) => s.provider);
  const customProviders = useSettings((s) => s.providers);
  const setProvider = useSettings((s) => s.setProvider);
  const addProvider = useSettings((s) => s.addProvider);
  const updateProvider = useSettings((s) => s.updateProvider);
  const deleteProvider = useSettings((s) => s.deleteProvider);

  const activeProvider = provider ?? defaultProviders[0];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const openDialog = (state: Exclude<DialogState, null>) => {
    setDropdownOpen(false);
    setTimeout(() => setDialog(state), 150);
  };

  const editingProvider =
    dialog?.mode === 'edit'
      ? customProviders.find((p) => p.url === dialog.url)
      : undefined;

  const allUrls = [
    ...defaultProviders.map((p) => p.url),
    ...customProviders.map((p) => p.url),
  ];
  const existingUrls =
    dialog?.mode === 'edit'
      ? allUrls.filter((url) => url !== dialog.url)
      : allUrls;

  const handleAdd = (values: RpcProviderValues) => {
    addProvider(values);
    setProvider(values);
    setDialog(null);
  };

  const handleUpdate = (values: RpcProviderValues) => {
    if (dialog?.mode !== 'edit') return;
    updateProvider(dialog.url, values);
    setDialog(null);
  };

  return (
    <>
      <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon-xs" variant="secondary">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            RPC
            <Button
              onClick={(e) => {
                e.preventDefault();
                openDialog({ mode: 'add' });
              }}
              size="icon-xs"
              variant="ghost"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {defaultProviders.map((p) => (
            <DropdownMenuCheckboxItem
              checked={p.url === activeProvider?.url}
              key={p.url}
              onClick={() => setProvider(p)}
            >
              {p.name}
            </DropdownMenuCheckboxItem>
          ))}
          {customProviders.length > 0 && <DropdownMenuSeparator />}
          {customProviders.map((p) => (
            <div className="group flex items-center" key={p.url}>
              <DropdownMenuCheckboxItem
                checked={p.url === activeProvider?.url}
                className="flex-1 truncate"
                onClick={() => setProvider(p)}
              >
                {p.name}
              </DropdownMenuCheckboxItem>
              <div className="mr-1 hidden gap-0.5 group-hover:flex">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    openDialog({ mode: 'edit', url: p.url });
                  }}
                  size="icon-xs"
                  variant="ghost"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteProvider(p.url);
                  }}
                  size="icon-xs"
                  variant="ghost"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        onOpenChange={(open) => !open && setDialog(null)}
        open={dialog !== null}
      >
        <DialogContent>
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-headline-sm -mt-2">
              {dialog?.mode === 'edit' ? 'Edit Provider' : 'Add Provider'}
            </DialogTitle>
          </DialogHeader>
          <RpcProviderForm
            defaultValues={editingProvider}
            existingUrls={existingUrls}
            onCancel={() => setDialog(null)}
            onSubmit={dialog?.mode === 'edit' ? handleUpdate : handleAdd}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
