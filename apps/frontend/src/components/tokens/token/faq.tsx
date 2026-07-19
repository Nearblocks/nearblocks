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
import { useLocale } from '@/hooks/use-locale';
import {
  countFormat,
  currencyFormat,
  dateFormat,
  numberFormat,
  toMs,
} from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<FTContractRes>;
  deploymentsPromise?: Promise<ContractDeployment[] | null>;
  holderCountPromise?: Promise<FTContractHolderCountRes>;
  loading?: boolean;
  txnCountPromise?: Promise<FTContractTxnCountRes>;
};

export const TokenFaq = ({
  contractPromise,
  deploymentsPromise,
  holderCountPromise,
  loading,
  txnCountPromise,
}: Props) => {
  const { t } = useLocale('fts');
  const contractRes = !loading && contractPromise ? use(contractPromise) : null;
  const deployments =
    !loading && deploymentsPromise ? use(deploymentsPromise) : null;
  const txnCountRes = !loading && txnCountPromise ? use(txnCountPromise) : null;
  const holderCountRes =
    !loading && holderCountPromise ? use(holderCountPromise) : null;

  const contract = contractRes?.data ?? null;
  const firstDeployment = deployments?.[0] ?? null;
  const txnCount = txnCountRes?.data ?? null;
  const holderCount = holderCountRes?.data ?? null;
  const name = contract?.name ?? contract?.symbol ?? 'this token';
  const symbol = contract?.symbol ?? '';

  return (
    <Card>
      <CardContent className="flex flex-col divide-y px-4 py-0">
        <div className="py-4">
          <SkeletonSlot
            fallback={
              <span className="text-headline-sm mb-3 block">
                <Skeleton className="w-50" />
              </span>
            }
            loading={!!loading}
          >
            {() => (
              <h3 className="text-headline-sm mb-3">
                {t('faq.priceTitle', { name })}
              </h3>
            )}
          </SkeletonSlot>
          <SkeletonSlot
            fallback={
              <span className="text-body-sm block">
                <span className="block">
                  <Skeleton className="w-full" />
                </span>
                <span className="block">
                  <Skeleton className="w-full" />
                </span>
                <span className="block">
                  <Skeleton className="w-2/3" />
                </span>
              </span>
            }
            loading={!!loading}
          >
            {() => (
              <p className="text-body-sm text-muted-foreground">
                {t('faq.priceLive', { name })}{' '}
                {contract?.price ? (
                  <span className="text-foreground">
                    {currencyFormat(contract.price)}
                  </span>
                ) : (
                  'N/A'
                )}{' '}
                {t('faq.priceCircMC')}{' '}
                {contract?.market_cap && +contract.market_cap > 0 ? (
                  <span className="text-foreground">
                    {currencyFormat(contract.market_cap, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                ) : (
                  'N/A'
                )}
                . {t('faq.priceOnchainMC', { name })}{' '}
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
                . {symbol}
                {t('faq.priceVolume')}{' '}
                {contract?.volume_24h && +contract.volume_24h > 0 ? (
                  <span className="text-foreground">
                    {currencyFormat(contract.volume_24h, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                ) : (
                  'N/A'
                )}{' '}
                {symbol} {t('faq.priceUpdated')}
                {contract?.change_24h && (
                  <>
                    {' '}
                    {name} is{' '}
                    <span className="text-foreground">
                      {+contract.change_24h > 0
                        ? t('faq.priceUp')
                        : t('faq.priceDown')}{' '}
                      {contract.change_24h}%
                    </span>{' '}
                    {t('faq.priceLast24h')}
                  </>
                )}
              </p>
            )}
          </SkeletonSlot>
        </div>
        <div className="py-4">
          <SkeletonSlot
            fallback={
              <span className="text-headline-sm mb-3 block">
                <Skeleton className="w-80" />
              </span>
            }
            loading={!!loading}
          >
            {() => (
              <h3 className="text-headline-sm mb-3">
                {t('faq.creationTitle', { name })}
              </h3>
            )}
          </SkeletonSlot>
          <SkeletonSlot
            fallback={
              <span className="text-body-sm block">
                <span className="block">
                  <Skeleton className="w-full" />
                </span>
                <span className="block">
                  <Skeleton className="w-1/2" />
                </span>
              </span>
            }
            loading={!!loading}
          >
            {() => (
              <p className="text-body-sm text-muted-foreground">
                {firstDeployment ? (
                  <>
                    The{' '}
                    <AccountLink
                      account={contract?.contract}
                      className="inline-flex"
                      hideCopy
                      name={name}
                      textClassName="max-w-60 underline"
                    />{' '}
                    {t('faq.creationContractCreated')}{' '}
                    <span className="text-foreground">
                      {firstDeployment.block?.block_timestamp
                        ? dateFormat(
                            toMs(firstDeployment.block.block_timestamp),
                            'MMM-DD-YYYY HH:mm:ss',
                          )
                        : 'N/A'}
                    </span>{' '}
                    {t('faq.creationBy')}{' '}
                    <AccountLink
                      account={firstDeployment.predecessor_account_id}
                      className="inline-flex"
                      hideCopy
                      textClassName="max-w-60 underline"
                    />{' '}
                    {t('faq.creationThrough')}{' '}
                    <Link
                      className="text-link inline-block underline"
                      href={`/txns/${firstDeployment.transaction_hash}`}
                    >
                      {t('faq.creationThisTxn')}
                    </Link>
                    .
                  </>
                ) : (
                  <>{t('faq.creationNA', { name })}</>
                )}{' '}
                {txnCount?.count && (
                  <>
                    {t('faq.creationSince', { name })}{' '}
                    <span className="text-foreground">
                      {countFormat(txnCount.count)}
                    </span>{' '}
                    {t('faq.creationTransfers')}
                  </>
                )}
              </p>
            )}
          </SkeletonSlot>
        </div>
        <div className="py-4">
          <SkeletonSlot
            fallback={
              <span className="text-headline-sm mb-3 block">
                <Skeleton className="w-65" />
              </span>
            }
            loading={!!loading}
          >
            {() => (
              <h3 className="text-headline-sm mb-3">
                {t('faq.supplyTitle', { name })}
              </h3>
            )}
          </SkeletonSlot>
          <SkeletonSlot
            fallback={
              <span className="text-body-sm block">
                <span className="block">
                  <Skeleton className="w-full" />
                </span>
                <span className="block">
                  <Skeleton className="w-1/3" />
                </span>
              </span>
            }
            loading={!!loading}
          >
            {() => (
              <p className="text-body-sm text-muted-foreground">
                {contract?.total_supply ? (
                  <>
                    {t('faq.supplyTotal')}{' '}
                    <span className="text-foreground">
                      {numberFormat(contract.total_supply, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    .
                  </>
                ) : (
                  t('faq.supplyNA')
                )}{' '}
                {holderCount?.count && (
                  <>
                    {symbol}
                    {t('faq.supplySplit')}{' '}
                    <span className="text-foreground">
                      {numberFormat(holderCount.count)}
                    </span>{' '}
                    {t('faq.supplyWallets')}
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
