import { useDebounceFn } from 'ahooks';
import { useState } from 'react';

import { SearchRes } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { initialResults, searchKeyword } from '@/lib/search';
import { Input } from '@/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/ui/popover';

import { SearchItem } from './item';
import { SearchLink } from './link';

type Props = {
  filter: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  startTransition: (callback: () => void) => void;
};

export const SearchPopover = ({
  filter,
  open,
  setOpen,
  startTransition,
}: Props) => {
  const { t } = useLocale('layout');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<null | SearchRes['data']>(
    initialResults,
  );

  const { run } = useDebounceFn(
    (value: string) => {
      startTransition(async () => {
        try {
          const resp = await searchKeyword(value, filter);

          setResults(resp);
          setOpen(
            !!resp &&
              (resp.accounts.length > 0 ||
                resp.blocks.length > 0 ||
                resp.fts.length > 0 ||
                resp.txns.length > 0),
          );
        } catch (error) {
          console.log(error);
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
    setOpen(
      !!results &&
        (results.accounts.length > 0 ||
          results.blocks.length > 0 ||
          results.fts.length > 0 ||
          results.txns.length > 0),
    );
  };

  return (
    <Popover onOpenChange={(open) => setOpen(open)} open={open}>
      <PopoverAnchor asChild>
        <Input
          className="text-white-950 placeholder:text-white-950/60 h-9 border-0 bg-transparent! shadow-none"
          name="keyword"
          onChange={onChange}
          onFocus={onFocus}
          placeholder={t('search.placeholder')}
          value={keyword}
        />
      </PopoverAnchor>
      <PopoverContent
        className="divide-border w-(--radix-popper-anchor-width) max-w-200 divide-y p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        sideOffset={12}
      >
        {results && results.accounts.length > 0 && (
          <SearchItem title={t('search.addresses')}>
            {results.accounts.map((account) => (
              <SearchLink
                href={`/address/${account.account_id}`}
                key={account.account_id}
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
                href={`/block/${block.block_hash}`}
                key={block.block_hash}
              >
                {block.block_hash}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.fts.length > 0 && (
          <SearchItem title={t('search.tokens')}>
            {results.fts.map((ft) => (
              <SearchLink href={`/token/${ft.contract}`} key={ft.contract}>
                {ft.contract}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.txns.length > 0 && (
          <SearchItem title={t('search.txns')}>
            {results.txns.map((txn) => (
              <SearchLink
                href={`/txns/${txn.transaction_hash}`}
                key={txn.transaction_hash}
              >
                {txn.transaction_hash}
              </SearchLink>
            ))}
          </SearchItem>
        )}
      </PopoverContent>
    </Popover>
  );
};
