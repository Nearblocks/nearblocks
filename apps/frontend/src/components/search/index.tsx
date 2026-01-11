'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LuSearch } from 'react-icons/lu';

import { searchKeyword } from '@/lib/search';
import { Button } from '@/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '@/ui/button-group';
import { Spinner } from '@/ui/spinner';

import { SearchFilter } from './filter';
import { SearchPopover } from './popover';

export const SearchBar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const resp = await searchKeyword(form.get('keyword') as string, filter);

      if (resp?.accounts.length)
        router.push(`/address/${resp.accounts[0].account_id}`);
      if (resp?.blocks.length)
        router.push(`/block/${resp.blocks[0].block_hash}`);
      if (resp?.fts.length) router.push(`/token/${resp.fts[0].contract}`);
      if (resp?.txns.length)
        router.push(`/txns/${resp.txns[0].transaction_hash}`);
    });
  };

  return (
    <form
      className="gap-2 mt-4 text-body-sm max-w-200"
      method="post"
      onSubmit={onSubmit}
    >
      <ButtonGroup className="items-center w-full h-12 bg-white border rounded-lg shadow-sm isolate border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
        <ButtonGroup className="hidden pl-1 md:flex">
          <SearchFilter filter={filter} onSelect={onSelect} />
        </ButtonGroup>
        <ButtonGroupSeparator className="hidden h-8! self-auto bg-neutral-200 md:flex dark:bg-neutral-700" />
        <ButtonGroup className="grow">
          <SearchPopover
            filter={filter}
            open={open}
            setOpen={setOpen}
            startTransition={startTransition}
          />
        </ButtonGroup>
        <ButtonGroup className="pr-2">
          <Button
            className="h-8! rounded-lg"
            disabled={isPending}
            size="icon-lg"
            type="submit"
            variant="default"
          >
            {isPending ? (
              <Spinner className="size-4" />
            ) : (
              <LuSearch className="size-4" />
            )}
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </form>
  );
};
