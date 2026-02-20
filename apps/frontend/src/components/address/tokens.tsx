'use client';

import { ChevronsUpDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Fragment, use, useMemo, useState } from 'react';

import { AccountAssetFT } from 'nb-schemas';

import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { currencyFormat, numberFormat, toTokenAmount } from '@/lib/format';
import { mergeTokens, sortTokens } from '@/lib/token';
import { TokenCache } from '@/types/types';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { ScrollArea } from '@/ui/scroll-area';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  tokenCachePromise?: Promise<null | TokenCache[]>;
  tokensPromise?: Promise<AccountAssetFT[] | null>;
};

export const Tokens = ({
  loading,
  tokenCachePromise,
  tokensPromise,
}: Props) => {
  const tokens = !loading && tokensPromise ? use(tokensPromise) : null;
  const tokenCache =
    !loading && tokenCachePromise ? use(tokenCachePromise) : null;

  const { address } = useParams<{ address: string }>();
  const { data: balances, isLoading } = useTokenBalances(
    !loading && tokens && !tokenCache ? { account: address, tokens } : null,
  );
  const [open, setOpen] = useState(false);

  const inventory = useMemo(() => {
    const merged = tokenCache ? mergeTokens(tokens, tokenCache) : balances;

    return sortTokens(merged);
  }, [tokens, tokenCache, balances]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <SkeletonSlot
        fallback={<Skeleton className="h-9 w-full" />}
        loading={loading || !tokens || isLoading}
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
              <ChevronsUpDown className="opacity-50" />
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
                            <span>
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
                        <span className="flex flex-col gap-1 text-right">
                          <span>{currencyFormat(token.price)}</span>
                          {token.meta?.price && (
                            <span>
                              @$
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
