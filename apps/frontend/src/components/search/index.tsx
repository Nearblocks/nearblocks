'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useSearchHistory } from '@/hooks/use-search-history';
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
  const { addToHistory, clearHistory, history, removeFromHistory } =
    useSearchHistory();

  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const navigateByKeyword = (kw: string) => {
    startTransition(async () => {
      const resp = await searchKeyword(kw, filter);

      const hasResults =
        resp &&
        (resp.accounts.length > 0 ||
          resp.blocks.length > 0 ||
          resp.fts.length > 0 ||
          resp.txns.length > 0);

      if (!hasResults) return;

      if (resp.accounts.length) {
        const href = `/address/${resp.accounts[0].account_id}`;
        addToHistory({
          href,
          label: resp.accounts[0].account_id,
          type: 'account',
        });
        router.push(href);
      } else if (resp.blocks.length) {
        const href = `/blocks/${resp.blocks[0].block_hash}`;
        addToHistory({ href, label: resp.blocks[0].block_hash, type: 'block' });
        router.push(href);
      } else if (resp.fts.length) {
        const href = `/tokens/${resp.fts[0].contract}`;
        addToHistory({ href, label: resp.fts[0].contract, type: 'token' });
        router.push(href);
      } else if (resp.txns.length) {
        const href = `/txns/${resp.txns[0].transaction_hash}`;
        addToHistory({
          href,
          label: resp.txns[0].transaction_hash,
          type: 'txn',
        });
        router.push(href);
      }
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    navigateByKeyword(form.get('keyword') as string);
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
            addToHistory={addToHistory}
            className={size === 'lg' ? 'h-9' : 'h-7'}
            clearHistory={clearHistory}
            filter={filter}
            history={history}
            open={open}
            removeFromHistory={removeFromHistory}
            setOpen={setOpen}
            startTransition={startTransition}
          />
        </ButtonGroup>
        <kbd className="text-muted-foreground bg-muted hidden size-6 items-center justify-center rounded-md font-mono text-xs md:inline-flex">
          /
        </kbd>
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
              <Search className="size-4" />
            )}
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </form>
  );
};
