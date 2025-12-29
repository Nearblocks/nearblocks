import { useDebounceFn } from 'ahooks';
import { useState } from 'react';

import { Search } from 'nb-schemas';

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
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<null | Search>(initialResults);

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
          placeholder="Search by Account ID / Txn Hash / Block"
          value={keyword}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="divide-border w-(--radix-popper-anchor-width) max-w-200 divide-y p-0"
        sideOffset={12}
      >
        {results && results.accounts.length > 0 && (
          <SearchItem title="Addresses">
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
          <SearchItem title="Blocks">
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
          <SearchItem title="Tokens">
            {results.fts.map((ft) => (
              <SearchLink href={`/token/${ft.contract}`} key={ft.contract}>
                {ft.contract}
              </SearchLink>
            ))}
          </SearchItem>
        )}
        {results && results.txns.length > 0 && (
          <SearchItem title="Txns">
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
