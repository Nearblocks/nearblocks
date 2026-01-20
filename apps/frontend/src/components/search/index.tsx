'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LuSearch } from 'react-icons/lu';

import { searchKeyword } from '@/lib/search';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '@/ui/button-group';
import { Spinner } from '@/ui/spinner';

import { SearchFilter } from './filter';
import { SearchPopover } from './popover';

type Props = {
  size?: 'lg' | 'sm';
};

export const SearchBar = ({ size = 'lg' }: Props) => {
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
    <form className="text-body-sm" method="post" onSubmit={onSubmit}>
      <ButtonGroup
        className={cn(
          'bg-card isolate w-full items-center rounded-lg border',
          size === 'lg' ? 'h-12' : 'h-9',
        )}
      >
        <ButtonGroup className="hidden pl-1 md:flex">
          <SearchFilter
            className={size === 'lg' ? 'h-9 w-34' : 'h-7 w-30'}
            filter={filter}
            onSelect={onSelect}
          />
        </ButtonGroup>
        <ButtonGroupSeparator className="bg-border hidden h-8! self-auto md:flex" />
        <ButtonGroup className="grow">
          <SearchPopover
            className={size === 'lg' ? 'h-9' : 'h-7'}
            filter={filter}
            open={open}
            setOpen={setOpen}
            startTransition={startTransition}
          />
        </ButtonGroup>
        <ButtonGroup className={size === 'lg' ? 'pr-2' : 'pr-1'}>
          <Button
            className={cn('rounded-lg', size === 'lg' && 'w-9')}
            disabled={isPending}
            size={size === 'lg' ? 'icon-sm' : 'icon-xs'}
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
