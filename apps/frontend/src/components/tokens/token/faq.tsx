'use client';

import { use } from 'react';

import {
  ContractDeployment,
  FTContractHolderCountRes,
  FTContractRes,
  FTContractTxnCountRes,
} from 'nb-schemas';

import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { currencyFormat, dateFormat, numberFormat, toMs } from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<FTContractRes>;
  deploymentsPromise?: Promise<ContractDeployment[] | null>;
  holderCountPromise?: Promise<FTContractHolderCountRes>;
  loading?: boolean;
  txCountPromise?: Promise<FTContractTxnCountRes>;
};

export const TokenFaq = ({
  contractPromise,
  deploymentsPromise,
  holderCountPromise,
  loading,
  txCountPromise,
}: Props) => {
  const contractRes = !loading && contractPromise ? use(contractPromise) : null;
  const deployments =
    !loading && deploymentsPromise ? use(deploymentsPromise) : null;
  const txCountRes = !loading && txCountPromise ? use(txCountPromise) : null;
  const holderCountRes =
    !loading && holderCountPromise ? use(holderCountPromise) : null;

  const contract = contractRes?.data ?? null;
  const firstDeployment = deployments?.[0] ?? null;
  const txCount = txCountRes?.data ?? null;
  const holderCount = holderCountRes?.data ?? null;

  const name = contract?.name ?? contract?.symbol ?? 'this token';
  const symbol = contract?.symbol ?? '';

  return (
    <Card>
      <CardContent className="flex flex-col divide-y px-4 py-0">
        <div className="py-4">
          <SkeletonSlot
            fallback={<Skeleton className="mb-3 h-4 w-50" />}
            loading={loading || !contract}
          >
            {() => (
              <h3 className="text-headline-sm mb-3">
                What is {name} price now?
              </h3>
            )}
          </SkeletonSlot>
          <SkeletonSlot
            fallback={<Skeleton className="h-12 w-full" />}
            loading={loading || !contract}
          >
            {() => (
              <p className="text-body-sm text-muted-foreground">
                The live price of {name} is{' '}
                {contract?.price ? (
                  <span className="text-foreground">
                    {currencyFormat(contract.price)}
                  </span>
                ) : (
                  'N/A'
                )}{' '}
                today with a current circulating market cap of{' '}
                {contract?.market_cap && +contract.market_cap > 0 ? (
                  <span className="text-foreground">
                    {currencyFormat(contract.market_cap, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                ) : (
                  'N/A'
                )}
                . The on-chain market cap of {name} is{' '}
                {contract?.onchain_market_cap &&
                +contract.onchain_market_cap > 0 ? (
                  <span className="text-foreground">
                    {currencyFormat(contract.onchain_market_cap, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                ) : (
                  'N/A'
                )}
                . {name}&apos;s 24-hour trading volume is{' '}
                {contract?.volume_24h && +contract.volume_24h > 0 ? (
                  <span className="text-foreground">
                    {currencyFormat(contract.volume_24h, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                ) : (
                  'N/A'
                )}{' '}
                {symbol} to USD price is updated in real-time.
                {contract?.change_24h && (
                  <>
                    {' '}
                    {name} is{' '}
                    <span className="text-foreground">
                      {+contract.change_24h > 0 ? 'up' : 'down'}{' '}
                      {contract.change_24h}%
                    </span>{' '}
                    in the last 24 hours.
                  </>
                )}
              </p>
            )}
          </SkeletonSlot>
        </div>
        <div className="py-4">
          <SkeletonSlot
            fallback={
              <div>
                <Skeleton className="mb-3 h-4 w-80" />
              </div>
            }
            loading={loading || !contract}
          >
            {() => (
              <h3 className="text-headline-sm mb-3">
                When was {name} created on Near Protocol?
              </h3>
            )}
          </SkeletonSlot>
          <SkeletonSlot
            fallback={<Skeleton className="h-6 w-3/5" />}
            loading={loading || !contract}
          >
            {() => (
              <p className="text-body-sm text-muted-foreground">
                {firstDeployment ? (
                  <>
                    The{' '}
                    <AccountLink
                      account={contract?.contract}
                      hideCopy
                      name={name}
                      textClassName="max-w-60 underline"
                    />{' '}
                    contract was created on Near Protocol at{' '}
                    <span className="text-foreground">
                      {firstDeployment.block?.block_timestamp
                        ? dateFormat(
                            toMs(firstDeployment.block.block_timestamp),
                            'MMM-DD-YYYY HH:mm:ss',
                          )
                        : 'N/A'}
                    </span>{' '}
                    by{' '}
                    <AccountLink
                      account={firstDeployment.predecessor_account_id}
                      hideCopy
                      textClassName="max-w-60 underline"
                    />{' '}
                    through{' '}
                    <Link
                      className="text-link underline"
                      href={`/txns/${firstDeployment.transaction_hash}`}
                    >
                      this transaction
                    </Link>
                    .
                  </>
                ) : (
                  <>Creation information is not available for {name}.</>
                )}{' '}
                {txCount?.count && (
                  <>
                    Since the creation of {name}, there has been{' '}
                    <span className="text-foreground">
                      {numberFormat(txCount.count)}
                    </span>{' '}
                    on-chain transfers.
                  </>
                )}
              </p>
            )}
          </SkeletonSlot>
        </div>
        <div className="py-4">
          <SkeletonSlot
            fallback={
              <div>
                <Skeleton className="mb-3 h-4 w-65" />
              </div>
            }
            loading={loading || !contract}
          >
            {() => (
              <h3 className="text-headline-sm mb-3">
                How many {name} tokens are there?
              </h3>
            )}
          </SkeletonSlot>
          <SkeletonSlot
            fallback={<Skeleton className="h-6 w-3/4" />}
            loading={loading || !contract}
          >
            {() => (
              <p className="text-body-sm text-muted-foreground">
                {contract?.total_supply ? (
                  <>
                    There is a total supply of{' '}
                    <span className="text-foreground">
                      {numberFormat(contract.total_supply, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    .
                  </>
                ) : (
                  'Total supply is not available.'
                )}{' '}
                {holderCount?.count && (
                  <>
                    {symbol}&apos;s supply is split between{' '}
                    <span className="text-foreground">
                      {numberFormat(holderCount.count)}
                    </span>{' '}
                    different wallet addresses.
                  </>
                )}
              </p>
            )}
          </SkeletonSlot>
        </div>
      </CardContent>
    </Card>
  );
};
