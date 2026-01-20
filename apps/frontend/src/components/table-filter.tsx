'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { LuListFilter } from 'react-icons/lu';

import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';

export type FilterData = Record<string, string | undefined>;
export type FilterClearData = Record<string, undefined>;

type Props = {
  name: string;
  onClear: (value: FilterClearData) => void;
  onFilter: (value: FilterData) => void;
};

export const TableFilter = ({ name, onClear, onFilter }: Props) => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get(name) ?? '');

  const onSumbit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFilter({ [name]: search });
  };

  const handleClear = () => {
    setSearch('');
    onClear({ [name]: undefined });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon-xs" variant="ghost">
          <LuListFilter className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-50 p-3">
        <form onSubmit={onSumbit}>
          <Input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            type="text"
            value={search}
          />
          <div className="mt-3 flex gap-1">
            <Button className="grow" size="xs" type="submit">
              Filter
            </Button>
            <Button
              className="grow"
              onClick={handleClear}
              size="xs"
              type="button"
              variant="secondary"
            >
              Clear
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
