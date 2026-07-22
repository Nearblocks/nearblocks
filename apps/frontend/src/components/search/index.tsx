'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { HistoryEntry } from '@/hooks/use-search-history';
import { useSearchHistory } from '@/hooks/use-search-history';
import { searchKeyword } from '@/lib/search';
import { cn, encodeToken } from '@/lib/utils';
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
      try {
        const resp = await searchKeyword(kw, filter);
        if (!resp) return;

        const routes: Array<HistoryEntry | undefined> = [
          resp.accounts?.[0] && {
            href: `/address/${resp.accounts[0].account_id}`,
            label: resp.accounts[0].account_id,
            type: 'account',
          },
          resp.blocks?.[0] && {
            href: `/blocks/${resp.blocks[0].block_hash}`,
            label: resp.blocks[0].block_hash,
            type: 'block',
          },
          resp.fts?.[0] && {
            href: `/tokens/${resp.fts[0].contract}`,
            label: resp.fts[0].contract,
            type: 'token',
          },
          resp.mts?.[0] && {
            href: `/mt-tokens/${resp.mts[0].contract}/tokens/${encodeToken(
              resp.mts[0].token,
            )}`,
            label: resp.mts[0].token,
            type: 'token',
          },
          resp.nfts?.[0] && {
            href: `/nft-tokens/${resp.nfts[0].contract}`,
            label: resp.nfts[0].contract,
            type: 'token',
          },
          resp.txns?.[0] && {
            href: `/txns/${resp.txns[0].transaction_hash}`,
            label: resp.txns[0].transaction_hash,
            type: 'txn',
          },
          resp.receipts?.[0] && {
            href: `/txns/${resp.receipts[0].transaction_hash}/execution#${resp.receipts[0].receipt_id}`,
            label: resp.receipts[0].receipt_id,
            type: 'txn',
          },
          resp.keys?.[0] && {
            href: `/address/${resp.keys[0].account_id}/keys`,
            label: resp.keys[0].account_id,
            type: 'account',
          },
        ];

        const match = routes.find(Boolean);

        if (!match) return;

        addToHistory(match);
        router.push(match.href);
      } catch (error) {
        console.error(error);
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
        <ButtonGroup className={size === 'lg' ? 'pr-2' : 'pr-1'}>
          <Button
            className={cn('rounded-lg', size === 'lg' && 'w-9')}
            disabled={isPending}
            size={size === 'lg' ? 'icon-sm' : 'icon-xs'}
            type="submit"
            variant="default"
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
