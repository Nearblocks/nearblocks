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
      className="text-body-sm mt-4 max-w-200 gap-2"
      method="post"
      onSubmit={onSubmit}
    >
      <ButtonGroup className="bg-white-950/15 border-white-950/60 isolate h-12 w-full items-center rounded-xl border backdrop-blur">
        <ButtonGroup className="hidden pl-1 lg:flex">
          <SearchFilter filter={filter} onSelect={onSelect} />
        </ButtonGroup>
        <ButtonGroupSeparator className="bg-white-950/60 hidden h-8! self-auto sm:flex" />
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
            className="bg-white-950! h-8! rounded-lg text-neutral-950"
            disabled={isPending}
            size="icon-lg"
            type="submit"
            variant="secondary"
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
