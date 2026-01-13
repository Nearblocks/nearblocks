'use client';

import { useParams } from 'next/navigation';
import { Fragment, use, useEffect, useState } from 'react';
import { LuChevronsUpDown } from 'react-icons/lu';

import { AccountAssetFTsRes } from 'nb-schemas';

import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token-image';
import { currencyFormat, numberFormat, toTokenAmount } from '@/lib/format';
import { mergeTokens, sortTokens } from '@/lib/token';
import { TokenInventory, TokensCacheRes } from '@/types/types';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { ScrollArea } from '@/ui/scroll-area';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  tokenCachePromise?: Promise<TokensCacheRes['tokens']>;
  tokensPromise?: Promise<AccountAssetFTsRes['data']>;
};

export const Tokens = ({
  loading,
  tokenCachePromise,
  tokensPromise,
}: Props) => {
  const tokens = !loading && tokensPromise ? use(tokensPromise) : null;
  const tokenCache =
    !loading && tokenCachePromise ? use(tokenCachePromise) : null;
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { address } = useParams<{ address: string }>();
  const [inventory, setInventory] = useState<TokenInventory>({
    amount: 0,
    tokens: [],
  });

  useEffect(() => {
    let cancelled = false;

    const fetchInventory = async () => {
      if (!tokens || !address) return;

      try {
        const inventory = await mergeTokens(address, tokens, tokenCache);
        if (cancelled) return;
        setInventory(sortTokens(inventory));
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    fetchInventory();

    return () => {
      cancelled = true;
    };
  }, [address, tokens, tokenCache]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <SkeletonSlot
        fallback={<Skeleton className="h-9 w-full" />}
        loading={loading || !tokens || fetching}
      >
        {() => (
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              className="w-full justify-between"
              disabled={!inventory.tokens.length}
              role="combobox"
              variant="outline"
            >
              {inventory.tokens.length > 0 ? (
                <span className="flex items-center gap-2">
                  {currencyFormat(inventory.amount)}{' '}
                  <Badge variant="teal">
                    {numberFormat(inventory.tokens.length, {
                      maximumFractionDigits: 0,
                    })}
                  </Badge>
                </span>
              ) : (
                'N/A'
              )}
              <LuChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
        )}
      </SkeletonSlot>
      <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
        <Command>
          <CommandList className="max-h-none overflow-y-visible">
            <ScrollArea className="max-h-75">
              <CommandGroup>
                {inventory.tokens.map((token, index) => (
                  <Fragment key={token.contract}>
                    <CommandItem asChild>
                      <Link
                        className="text-body-xs flex items-center justify-between gap-2"
                        href={`/token/${token.contract}?account=${address}`}
                      >
                        <span className="flex flex-col gap-1">
                          <span className="flex items-center gap-2">
                            <TokenImage
                              alt={token.meta?.name ?? ''}
                              className="m-px size-5 rounded-full border"
                              src={token.meta?.icon ?? ''}
                            />
                            <span className="flex items-center">
                              <span className="max-w-30 truncate pr-1">
                                {token.meta?.name}
                              </span>
                              {token.meta?.symbol && (
                                <>
                                  (
                                  <span className="max-w-13 truncate">
                                    {token.meta?.symbol}
                                  </span>
                                  )
                                </>
                              )}
                            </span>
                          </span>
                          {token.meta?.decimals && (
                            <span className="">
                              {numberFormat(
                                toTokenAmount(
                                  token.amount,
                                  token.meta.decimals,
                                ),
                                { maximumFractionDigits: 6 },
                              )}
                            </span>
                          )}
                        </span>
                        <span className="flex flex-col gap-1">
                          <span>{currencyFormat(token.price)}</span>
                          {token.meta?.price && (
                            <span className="text-right">
                              {numberFormat(token.meta?.price, {
                                maximumFractionDigits: 6,
                              })}
                            </span>
                          )}
                        </span>
                      </Link>
                    </CommandItem>
                    {index < inventory.tokens.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </Fragment>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
