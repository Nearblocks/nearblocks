'use client';

import { RiQuestionLine } from '@remixicon/react';
import { ChartLine, ChevronRight } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import {
  AddressStats,
  DailyBlockStats,
  DailyTxnStats,
  PriceStats,
  TpsStats,
} from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { ErrorSuspense } from '@/components/error-suspense';
import { Link } from '@/components/link';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import {
  AddressesChartMini,
  BlocksChartMini,
  MarketCapChartMini,
  PriceChartMini,
  SupplyChartMini,
  TpsChartMini,
  TxnFeeChartMini,
  TxnsChartMini,
  TxnVolumeChartMini,
} from './charts';

type Props = {
  addressStatsPromise: Promise<AddressStats[] | null>;
  blockStatsPromise: Promise<DailyBlockStats[] | null>;
  priceStatsPromise: Promise<null | PriceStats[]>;
  tpsStatsPromise: Promise<null | TpsStats[]>;
  txnStatsPromise: Promise<DailyTxnStats[] | null>;
};

type CardProps = {
  children: React.ReactNode;
  href: string;
  title: string;
};

type HeaderProps = {
  description: string;
  logView: boolean;
  setLogView: Dispatch<SetStateAction<boolean>>;
};

export const Charts = ({
  addressStatsPromise,
  blockStatsPromise,
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
      <ChartCard href="/charts/addresses" title={t('addresses.miniTitle')}>
        <ErrorSuspense fallback={<AddressesChartMini loading />}>
          <AddressesChartMini statsPromise={addressStatsPromise} />
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

// Rendered inside a fixed-height chart slot when stats resolve null/empty so
// an empty dataset shows a "no data" state instead of a bare Highcharts frame.
// Copy matches the (untranslated) `fts.analytics.noData` string; the charts
// dictionaries have no equivalent key.
export const ChartEmpty = () => {
  return (
    <div className="flex h-full">
      <EmptyBox description="No data available" icon={<ChartLine />} />
    </div>
  );
};

export const ChartHeader = ({
  description,
  logView,
  setLogView,
}: HeaderProps) => {
  const { t } = useLocale('charts');
  return (
    <CardHeader className="flex-wrap gap-2 border-b">
      <p className="text-body-sm text-muted-foreground">{description}</p>
      <span className="flex items-center gap-2 leading-6 whitespace-nowrap">
        <Switch
          checked={logView}
          id="log-switch"
          onCheckedChange={setLogView}
        />
        <Label className="text-body-xs" htmlFor="log-switch">
          {t('logView')}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <RiQuestionLine className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="px-2.5 py-1">
            {t('logViewTip')}
          </TooltipContent>
        </Tooltip>
      </span>
    </CardHeader>
  );
};
