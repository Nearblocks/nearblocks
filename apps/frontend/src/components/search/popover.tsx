import { useDebounceFn } from 'ahooks';
import { ArrowLeftRight, Box, Coins, Trash, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Search } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import type { HistoryEntry } from '@/hooks/use-search-history';
import { initialResults, searchKeyword } from '@/lib/search';
import { cn, encodeToken } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/ui/popover';

import { SearchItem } from './item';
import { SearchLink } from './link';

type Props = {
  addToHistory: (entry: HistoryEntry) => void;
  className?: string;
  clearHistory: () => void;
  filter: string;
  history: HistoryEntry[];
  open: boolean;
  removeFromHistory: (href: string) => void;
  setOpen: (open: boolean) => void;
  startTransition: (callback: () => void) => void;
};

const HISTORY_ICONS = {
  account: User,
  block: Box,
  token: Coins,
  txn: ArrowLeftRight,
} as const;

const hasResults = (results: null | Search) =>
  !!results &&
  (results.accounts.length > 0 ||
    results.blocks.length > 0 ||
    results.fts.length > 0 ||
    results.keys.length > 0 ||
    results.mts.length > 0 ||
    results.nfts.length > 0 ||
    results.receipts.length > 0 ||
    results.txns.length > 0);

export const SearchPopover = ({
  addToHistory,
  className,
  clearHistory,
  filter,
  history,
  open,
  removeFromHistory,
  setOpen,
  startTransition,
}: Props) => {
  const { t } = useLocale('layout');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<null | Search>(initialResults);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !['INPUT', 'SELECT', 'TEXTAREA'].includes(
          (e.target as HTMLElement).tagName,
        ) &&
        inputRef.current
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { run } = useDebounceFn(
    (value: string) => {
      startTransition(async () => {
        try {
          const resp = await searchKeyword(value, filter);

          setResults(resp);
          setOpen(hasResults(resp));
        } catch (error) {
          console.error(error);
        }
      });
    },
    { wait: 350 },
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    run(e.target.value);
  };

  const onFocus = () => {
    if (!keyword && history.length > 0) {
      setOpen(true);
      return;
    }
    setOpen(hasResults(results));
  };

  const hasLiveResults = hasResults(results);

  return (
    <Popover onOpenChange={(open) => setOpen(open)} open={open}>
      <PopoverAnchor asChild>
        <Input
          autoComplete="off"
          className={cn(
            'bg-card dark:bg-card border-0 shadow-none focus-visible:border-neutral-300 focus-visible:ring-neutral-300/50',
            className,
          )}
          name="keyword"
          onChange={onChange}
          onFocus={onFocus}
          placeholder={t('search.placeholder')}
          ref={inputRef}
          value={keyword}
        />
      </PopoverAnchor>
      <PopoverContent
        className="divide-border w-(--radix-popper-anchor-width) max-w-200 divide-y p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        sideOffset={12}
      >
        {!hasLiveResults && history.length > 0 && (
          <SearchItem
            button={
              <Button
                className="-my-1"
                onClick={clearHistory}
                size="icon-xs"
                variant="ghost"
              >
                <Trash className="size-3" />
              </Button>
            }
            title={t('search.history')}
          >
            {history.map((item) => {
              const Icon = HISTORY_ICONS[item.type];
              return (
                <div className="flex items-center" key={item.href}>
                  <SearchLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                      setOpen(false);
                    }}
                  >
                    <Icon className="text-muted-foreground mr-2 inline size-3 shrink-0" />
                    {item.label}
                  </SearchLink>
                  <Button
                    onClick={() => removeFromHistory(item.href)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              );
            })}
          </SearchItem>
        )}
        {results && results.accounts.length > 0 && (
          <SearchItem title={t('search.addresses')}>
            {results.accounts.map((account) => (
              <SearchLink
                href={`/address/${account.account_id}`}
                key={account.account_id}
                onClick={() =>
                  addToHistory({
                    href: `/address/${account.account_id}`,
                    label: account.account_id,
                    type: 'account',
                  })
                }
              >
                {account.account_id}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.blocks.length > 0 && (
          <SearchItem title={t('search.blocks')}>
            {results.blocks.map((block) => (
              <SearchLink
                href={`/blocks/${block.block_hash}`}
                key={block.block_hash}
                onClick={() =>
                  addToHistory({
                    href: `/blocks/${block.block_hash}`,
                    label: block.block_hash,
                    type: 'block',
                  })
                }
              >
                {block.block_hash}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.fts.length > 0 && (
          <SearchItem title={t('search.tokens')}>
            {results.fts.map((ft) => (
              <SearchLink
                href={`/tokens/${ft.contract}`}
                key={ft.contract}
                onClick={() =>
                  addToHistory({
                    href: `/tokens/${ft.contract}`,
                    label: ft.contract,
                    type: 'token',
                  })
                }
              >
                {ft.contract}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.nfts.length > 0 && (
          <SearchItem title={t('search.nftTokens')}>
            {results.nfts.map((nft) => (
              <SearchLink
                href={`/nft-tokens/${nft.contract}`}
                key={nft.contract}
                onClick={() =>
                  addToHistory({
                    href: `/nft-tokens/${nft.contract}`,
                    label: nft.contract,
                    type: 'token',
                  })
                }
              >
                {nft.contract}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.mts.length > 0 && (
          <SearchItem title={t('search.mtTokens')}>
            {results.mts.map((mt) => {
              const href = `/mt-tokens/${mt.contract}/tokens/${encodeToken(
                mt.token,
              )}`;
              return (
                <SearchLink
                  href={href}
                  key={`${mt.contract}:${mt.token}`}
                  onClick={() =>
                    addToHistory({
                      href,
                      label: mt.token,
                      type: 'token',
                    })
                  }
                >
                  {mt.token} ({mt.contract})
                </SearchLink>
              );
            })}
          </SearchItem>
        )}
        {results && results.txns.length > 0 && (
          <SearchItem title={t('search.txns')}>
            {results.txns.map((txn) => (
              <SearchLink
                href={`/txns/${txn.transaction_hash}`}
                key={txn.transaction_hash}
                onClick={() =>
                  addToHistory({
                    href: `/txns/${txn.transaction_hash}`,
                    label: txn.transaction_hash,
                    type: 'txn',
                  })
                }
              >
                {txn.transaction_hash}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.receipts.length > 0 && (
          <SearchItem title={t('search.receipts')}>
            {results.receipts.map((receipt) => {
              const href = `/txns/${receipt.transaction_hash}/execution#${receipt.receipt_id}`;
              return (
                <SearchLink
                  href={href}
                  key={receipt.receipt_id}
                  onClick={() =>
                    addToHistory({
                      href,
                      label: receipt.receipt_id,
                      type: 'txn',
                    })
                  }
                >
                  {receipt.receipt_id}
                </SearchLink>
              );
            })}
          </SearchItem>
        )}
        {results && results.keys.length > 0 && (
          <SearchItem title={t('search.keys')}>
            {results.keys.map((key) => (
              <SearchLink
                href={`/address/${key.account_id}/keys`}
                key={key.account_id}
                onClick={() =>
                  addToHistory({
                    href: `/address/${key.account_id}/keys`,
                    label: key.account_id,
                    type: 'account',
                  })
                }
              >
                {key.account_id}
              </SearchLink>
            ))}
          </SearchItem>
        )}
      </PopoverContent>
    </Popover>
  );
};
