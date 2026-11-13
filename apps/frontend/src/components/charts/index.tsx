'use client';

import { ChevronRight } from 'lucide-react';

import {
  AddressStats,
  DailyBlockStats,
  DailyTxnStats,
  IntentsDailyCountPoint,
  IntentsMetricPoint,
  PriceStats,
  TpsStats,
} from 'nb-schemas';

import { ErrorSuspense } from '@/components/error-suspense';
import { Link } from '@/components/link';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';

import {
  AddressesChartMini,
  BlocksChartMini,
  ChunksChartMini,
  ContractsChartMini,
  GasChartMini,
  MarketCapChartMini,
  MetaTxnsChartMini,
  PriceChartMini,
  ReceiptsChartMini,
  SupplyChartMini,
  TpsChartMini,
  TxnFeeChartMini,
  TxnsChartMini,
  TxnVolumeChartMini,
} from './charts';
import { IntentsAccountsChartMini } from './intents-accounts';
import { IntentsSwapsChartMini } from './intents-swaps';
import { IntentsVolumeChartMini } from './intents-volume';

type Props = {
  addressStatsPromise: Promise<AddressStats[] | null>;
  blockStatsPromise: Promise<DailyBlockStats[] | null>;
  intentsAccountStatsPromise: Promise<IntentsDailyCountPoint[] | null>;
  intentsSwapStatsPromise: Promise<IntentsMetricPoint[] | null>;
  intentsVolumeStatsPromise: Promise<IntentsMetricPoint[] | null>;
  priceStatsPromise: Promise<null | PriceStats[]>;
  tpsStatsPromise: Promise<null | TpsStats[]>;
  txnStatsPromise: Promise<DailyTxnStats[] | null>;
};

type CardProps = {
  children: React.ReactNode;
  href: string;
  title: string;
};

export const Charts = ({
  addressStatsPromise,
  blockStatsPromise,
  intentsAccountStatsPromise,
  intentsSwapStatsPromise,
  intentsVolumeStatsPromise,
  priceStatsPromise,
  tpsStatsPromise,
  txnStatsPromise,
}: Props) => {
  const { t } = useLocale('charts');
  const network = useConfig((s) => s.config.network);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {network === 'mainnet' && (
        <>
          <ChartCard href="/charts/near-price" title={t('nearPrice.miniTitle')}>
            <ErrorSuspense fallback={<PriceChartMini loading />}>
              <PriceChartMini statsPromise={priceStatsPromise} />
            </ErrorSuspense>
          </ChartCard>
          <ChartCard href="/charts/market-cap" title={t('marketCap.miniTitle')}>
            <ErrorSuspense fallback={<MarketCapChartMini loading />}>
              <MarketCapChartMini statsPromise={priceStatsPromise} />
            </ErrorSuspense>
          </ChartCard>
        </>
      )}
      <ChartCard href="/charts/near-supply" title={t('nearSupply.miniTitle')}>
        <ErrorSuspense fallback={<SupplyChartMini loading />}>
          <SupplyChartMini statsPromise={blockStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/txns" title={t('txns.miniTitle')}>
        <ErrorSuspense fallback={<TxnsChartMini loading />}>
          <TxnsChartMini statsPromise={txnStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/blocks" title={t('blocks.miniTitle')}>
        <ErrorSuspense fallback={<BlocksChartMini loading />}>
          <BlocksChartMini statsPromise={blockStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/chunks" title={t('chunks.miniTitle')}>
        <ErrorSuspense fallback={<ChunksChartMini loading />}>
          <ChunksChartMini statsPromise={blockStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/addresses" title={t('addresses.miniTitle')}>
        <ErrorSuspense fallback={<AddressesChartMini loading />}>
          <AddressesChartMini statsPromise={addressStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/receipts" title={t('receipts.miniTitle')}>
        <ErrorSuspense fallback={<ReceiptsChartMini loading />}>
          <ReceiptsChartMini statsPromise={txnStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/gas" title={t('gas.miniTitle')}>
        <ErrorSuspense fallback={<GasChartMini loading />}>
          <GasChartMini statsPromise={blockStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/contracts" title={t('contracts.miniTitle')}>
        <ErrorSuspense fallback={<ContractsChartMini loading />}>
          <ContractsChartMini statsPromise={addressStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/meta-txns" title={t('metaTxns.miniTitle')}>
        <ErrorSuspense fallback={<MetaTxnsChartMini loading />}>
          <MetaTxnsChartMini txnStatsPromise={txnStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/tps" title={t('tps.miniTitle')}>
        <ErrorSuspense fallback={<TpsChartMini loading />}>
          <TpsChartMini statsPromise={tpsStatsPromise} />
        </ErrorSuspense>
      </ChartCard>
      {network === 'mainnet' && (
        <>
          <ChartCard href="/charts/txn-fee" title={t('txnFee.miniTitle')}>
            <ErrorSuspense fallback={<TxnFeeChartMini loading />}>
              <TxnFeeChartMini
                priceStatsPromise={priceStatsPromise}
                txnStatsPromise={txnStatsPromise}
              />
            </ErrorSuspense>
          </ChartCard>
          <ChartCard href="/charts/txn-volume" title={t('txnVolume.miniTitle')}>
            <ErrorSuspense fallback={<TxnVolumeChartMini loading />}>
              <TxnVolumeChartMini
                priceStatsPromise={priceStatsPromise}
                txnStatsPromise={txnStatsPromise}
              />
            </ErrorSuspense>
          </ChartCard>
          <ChartCard
            href="/charts/intents-volume"
            title={t('intentsVolume.miniTitle')}
          >
            <ErrorSuspense fallback={<IntentsVolumeChartMini loading />}>
              <IntentsVolumeChartMini
                statsPromise={intentsVolumeStatsPromise}
              />
            </ErrorSuspense>
          </ChartCard>
          <ChartCard
            href="/charts/intents-swaps"
            title={t('intentsSwaps.miniTitle')}
          >
            <ErrorSuspense fallback={<IntentsSwapsChartMini loading />}>
              <IntentsSwapsChartMini statsPromise={intentsSwapStatsPromise} />
            </ErrorSuspense>
          </ChartCard>
          <ChartCard
            href="/charts/intents-accounts"
            title={t('intentsAccounts.miniTitle')}
          >
            <ErrorSuspense fallback={<IntentsAccountsChartMini loading />}>
              <IntentsAccountsChartMini
                statsPromise={intentsAccountStatsPromise}
              />
            </ErrorSuspense>
          </ChartCard>
        </>
      )}
    </div>
  );
};

export const ChartCard = ({ children, href, title }: CardProps) => {
  const { t } = useLocale('charts');
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center justify-between gap-2 border-b py-3 pr-0">
        <span className="text-headline-sm">{title}</span>
        <Button asChild variant="link">
          <Link
            className="flex items-center gap-0 hover:no-underline"
            href={href}
          >
            <span>{t('view')}</span>
            <ChevronRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-3">{children}</CardContent>
    </Card>
  );
};

export { ChartEmpty, ChartHeader } from './chart-header';
