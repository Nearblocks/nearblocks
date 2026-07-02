'use client';

import { ChevronsUpDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { use, useMemo, useState } from 'react';

import { AccountAssetFT, AccountAssetMTFT } from 'nb-schemas';

import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';
import { useTokenBalances } from '@/hooks/use-token-balances';
import {
  currencyFormat,
  numberFormat,
  toTokenAmount,
  toTokenPrice,
} from '@/lib/format';
import { mergeTokens, sortTokens } from '@/lib/token';
import { encodeToken, isSpamToken } from '@/lib/utils';
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
  mtTokensPromise?: Promise<AccountAssetMTFT[] | null>;
  spamPatterns?: string[];
  tokenCachePromise?: Promise<null | TokenCache[]>;
  tokensPromise?: Promise<AccountAssetFT[] | null>;
};

type RowProps = {
  amount: string;
  decimals?: null | number;
  href: string;
  icon?: null | string;
  isLast: boolean;
  isSpam: boolean;
  name?: null | string;
  symbol?: null | string;
  unitPrice?: null | string;
  value: string;
};

const mtValue = (token: AccountAssetMTFT) =>
  token.token_meta?.price && token.meta?.decimals
    ? toTokenPrice(token.amount, token.meta.decimals, token.token_meta.price)
    : '0';

const TokenRow = ({
  amount,
  decimals,
  href,
  icon,
  isLast,
  isSpam,
  name,
  symbol,
  unitPrice,
  value,
}: RowProps) => {
  const { t } = useLocale('address');

  return (
    <>
      <CommandItem asChild>
        <Link
          className="text-body-xs grid grid-flow-col items-center justify-between gap-2 py-1.5"
          href={href}
        >
          <span className="flex flex-col truncate">
            <span className="flex items-center gap-1.5">
              <TokenImage
                alt={name ?? ''}
                className="size-4 rounded-full border"
                src={icon ?? ''}
              />
              <span className="flex items-center truncate">
                <span className="max-w-30 truncate pr-1">{name}</span>
                {symbol && (
                  <>
                    (<span className="max-w-13 truncate">{symbol}</span>)
                  </>
                )}
              </span>
            </span>
            {decimals && (
              <span className="text-muted-foreground pl-5.5">
                {numberFormat(toTokenAmount(amount, decimals), {
                  maximumFractionDigits: 6,
                })}
              </span>
            )}
          </span>
          <span className="flex flex-col text-right">
            {isSpam ? (
              <Badge variant="amber">{t('spam')}</Badge>
            ) : (
              <>
                <span>{currencyFormat(value)}</span>
                {unitPrice && (
                  <span className="text-muted-foreground">
                    @$
                    {numberFormat(unitPrice, {
                      maximumFractionDigits: 6,
                    })}
                  </span>
                )}
              </>
            )}
          </span>
        </Link>
      </CommandItem>
      {!isLast && <Separator />}
    </>
  );
};

export const Tokens = ({
  loading,
  mtTokensPromise,
  spamPatterns,
  tokenCachePromise,
  tokensPromise,
}: Props) => {
  const { t } = useLocale('address');
  const tokens = !loading && tokensPromise ? use(tokensPromise) : null;
  const mts = !loading && mtTokensPromise ? use(mtTokensPromise) : null;
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

  const mtTotal = useMemo(
    () => (mts ?? []).reduce((sum, token) => sum + Number(mtValue(token)), 0),
    [mts],
  );

  const totalCount = inventory.tokens.length + (mts?.length ?? 0);
  const totalValue = inventory.amount + mtTotal;

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
              disabled={!totalCount}
              role="combobox"
              variant="outline"
            >
              {totalCount > 0 ? (
                <span className="flex items-center gap-2">
                  {currencyFormat(totalValue)}{' '}
                  <Badge variant="teal">
                    {numberFormat(totalCount, {
                      maximumFractionDigits: 0,
                    })}
                  </Badge>
                </span>
              ) : (
                t('tokensNa')
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
              {inventory.tokens.length > 0 && (
                <CommandGroup heading={t('tokensLabel')}>
                  {inventory.tokens.map((token, index) => (
                    <TokenRow
                      amount={token.amount}
                      decimals={token.meta?.decimals}
                      href={`/tokens/${token.contract}?account=${address}`}
                      icon={token.meta?.icon}
                      isLast={index === inventory.tokens.length - 1}
                      isSpam={
                        !!spamPatterns &&
                        isSpamToken(token.contract, spamPatterns)
                      }
                      key={token.contract}
                      name={token.meta?.name}
                      symbol={token.meta?.symbol}
                      unitPrice={token.meta?.price}
                      value={token.price}
                    />
                  ))}
                </CommandGroup>
              )}
              {mts && mts.length > 0 && (
                <CommandGroup heading={t('mtTokensLabel')}>
                  {mts.map((token, index) => (
                    <TokenRow
                      amount={token.amount}
                      decimals={token.meta?.decimals}
                      href={`/mt-tokens/${token.contract}/tokens/${encodeToken(
                        token.token,
                      )}?account=${address}`}
                      icon={token.meta?.icon}
                      isLast={index === mts.length - 1}
                      isSpam={
                        !!spamPatterns &&
                        isSpamToken(token.contract, spamPatterns)
                      }
                      key={`${token.contract}:${token.token}`}
                      name={token.meta?.name}
                      symbol={token.meta?.symbol}
                      unitPrice={token.token_meta?.price}
                      value={mtValue(token)}
                    />
                  ))}
                </CommandGroup>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
