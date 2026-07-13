import { useDebounceFn } from 'ahooks';
import { ArrowLeftRight, Box, Coins, Trash, User, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

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

type SearchOption = {
  href: string;
  id: string;
  label: React.ReactNode;
  onRemove?: () => void;
  onSelect: () => void;
};

type SearchSection = {
  button?: React.ReactNode;
  key: string;
  options: SearchOption[];
  title: string;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<null | Search>(initialResults);
  const [activeIndex, setActiveIndex] = useState(-1);

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

  const sections = useMemo<SearchSection[]>(() => {
    const out: SearchSection[] = [];
    let index = 0;
    const optionId = () => `${listboxId}-option-${index++}`;

    if (!hasLiveResults && history.length > 0) {
      out.push({
        button: (
          <Button
            aria-label="Clear search history"
            className="-my-1"
            onClick={clearHistory}
            size="icon-xs"
            tabIndex={-1}
            variant="ghost"
          >
            <Trash className="size-3" />
          </Button>
        ),
        key: 'history',
        options: history.map((item) => {
          const Icon = HISTORY_ICONS[item.type];
          return {
            href: item.href,
            id: optionId(),
            label: (
              <>
                <Icon className="text-muted-foreground mr-2 inline size-3 shrink-0" />
                {item.label}
              </>
            ),
            onRemove: () => removeFromHistory(item.href),
            onSelect: () => setOpen(false),
          };
        }),
        title: t('search.history'),
      });
    }

    if (results) {
      if (results.accounts.length > 0) {
        out.push({
          key: 'accounts',
          options: results.accounts.map((account) => ({
            href: `/address/${account.account_id}`,
            id: optionId(),
            label: account.account_id,
            onSelect: () =>
              addToHistory({
                href: `/address/${account.account_id}`,
                label: account.account_id,
                type: 'account',
              }),
          })),
          title: t('search.addresses'),
        });
      }
      if (results.blocks.length > 0) {
        out.push({
          key: 'blocks',
          options: results.blocks.map((block) => ({
            href: `/blocks/${block.block_hash}`,
            id: optionId(),
            label: block.block_hash,
            onSelect: () =>
              addToHistory({
                href: `/blocks/${block.block_hash}`,
                label: block.block_hash,
                type: 'block',
              }),
          })),
          title: t('search.blocks'),
        });
      }
      if (results.fts.length > 0) {
        out.push({
          key: 'fts',
          options: results.fts.map((ft) => ({
            href: `/tokens/${ft.contract}`,
            id: optionId(),
            label: ft.contract,
            onSelect: () =>
              addToHistory({
                href: `/tokens/${ft.contract}`,
                label: ft.contract,
                type: 'token',
              }),
          })),
          title: t('search.tokens'),
        });
      }
      if (results.nfts.length > 0) {
        out.push({
          key: 'nfts',
          options: results.nfts.map((nft) => ({
            href: `/nft-tokens/${nft.contract}`,
            id: optionId(),
            label: nft.contract,
            onSelect: () =>
              addToHistory({
                href: `/nft-tokens/${nft.contract}`,
                label: nft.contract,
                type: 'token',
              }),
          })),
          title: t('search.nftTokens'),
        });
      }
      if (results.mts.length > 0) {
        out.push({
          key: 'mts',
          options: results.mts.map((mt) => {
            const href = `/mt-tokens/${mt.contract}/tokens/${encodeToken(
              mt.token,
            )}`;
            return {
              href,
              id: optionId(),
              label: `${mt.token} (${mt.contract})`,
              onSelect: () =>
                addToHistory({
                  href,
                  label: mt.token,
                  type: 'token',
                }),
            };
          }),
          title: t('search.mtTokens'),
        });
      }
      if (results.txns.length > 0) {
        out.push({
          key: 'txns',
          options: results.txns.map((txn) => ({
            href: `/txns/${txn.transaction_hash}`,
            id: optionId(),
            label: txn.transaction_hash,
            onSelect: () =>
              addToHistory({
                href: `/txns/${txn.transaction_hash}`,
                label: txn.transaction_hash,
                type: 'txn',
              }),
          })),
          title: t('search.txns'),
        });
      }
      if (results.receipts.length > 0) {
        out.push({
          key: 'receipts',
          options: results.receipts.map((receipt) => {
            const href = `/txns/${receipt.transaction_hash}/execution#${receipt.receipt_id}`;
            return {
              href,
              id: optionId(),
              label: receipt.receipt_id,
              onSelect: () =>
                addToHistory({
                  href,
                  label: receipt.receipt_id,
                  type: 'txn',
                }),
            };
          }),
          title: t('search.receipts'),
        });
      }
      if (results.keys.length > 0) {
        out.push({
          key: 'keys',
          options: results.keys.map((key) => ({
            href: `/address/${key.account_id}/keys`,
            id: optionId(),
            label: key.account_id,
            onSelect: () =>
              addToHistory({
                href: `/address/${key.account_id}/keys`,
                label: key.account_id,
                type: 'account',
              }),
          })),
          title: t('search.keys'),
        });
      }
    }

    return out;
  }, [
    addToHistory,
    clearHistory,
    hasLiveResults,
    history,
    listboxId,
    removeFromHistory,
    results,
    setOpen,
    t,
  ]);

  const flatOptions = useMemo(
    () => sections.flatMap((section) => section.options),
    [sections],
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [flatOptions, open]);

  useEffect(() => {
    if (activeIndex >= 0)
      document
        .getElementById(flatOptions[activeIndex]?.id ?? '')
        ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, flatOptions]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (
        e.key === 'ArrowDown' &&
        (hasLiveResults || (!keyword && history.length > 0))
      ) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    const count = flatOptions.length;
    if (!count) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(count - 1);
        break;
      case 'Enter': {
        const active = activeIndex >= 0 ? flatOptions[activeIndex] : null;
        if (!active) return;
        e.preventDefault();
        document.getElementById(active.id)?.click();
        setOpen(false);
        break;
      }
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
    }
  };

  return (
    <Popover onOpenChange={(open) => setOpen(open)} open={open}>
      <PopoverAnchor asChild>
        <Input
          aria-activedescendant={
            activeIndex >= 0 ? flatOptions[activeIndex]?.id : undefined
          }
          aria-autocomplete="list"
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
          autoComplete="off"
          className={cn(
            'bg-card dark:bg-card border-0 shadow-none focus-visible:border-neutral-300 focus-visible:ring-neutral-300/50',
            className,
          )}
          name="keyword"
          onChange={onChange}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder={t('search.placeholder')}
          ref={inputRef}
          role="combobox"
          value={keyword}
        />
      </PopoverAnchor>
      <PopoverContent
        className="divide-border max-h-(--radix-popover-content-available-height) w-(--radix-popper-anchor-width) max-w-200 divide-y overflow-y-auto p-0"
        id={listboxId}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        role="listbox"
        sideOffset={12}
      >
        {sections.map((section) => (
          <SearchItem
            button={section.button}
            key={section.key}
            title={section.title}
          >
            {section.options.map((option) => {
              const index = flatOptions.indexOf(option);
              const link = (
                <SearchLink
                  active={index === activeIndex}
                  href={option.href}
                  id={option.id}
                  key={option.id}
                  onClick={option.onSelect}
                  onMouseMove={() => setActiveIndex(index)}
                >
                  {option.label}
                </SearchLink>
              );

              if (option.onRemove) {
                return (
                  <div className="flex items-center" key={option.id}>
                    {link}
                    <Button
                      aria-label="Remove from search history"
                      onClick={option.onRemove}
                      size="icon-xs"
                      tabIndex={-1}
                      variant="ghost"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                );
              }

              return link;
            })}
          </SearchItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
