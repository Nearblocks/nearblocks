'use client';

import { RiQuestionLine } from '@remixicon/react';
import { ChevronRight } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import { DailyStats } from 'nb-schemas';

import { ErrorSuspense } from '@/components/error-suspense';
import { Link } from '@/components/link';
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
  TxnFeeChartMini,
  TxnsChartMini,
  TxnVolumeChartMini,
} from './charts';

type Props = {
  statsPromise: Promise<DailyStats[] | null>;
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

export const Charts = ({ statsPromise }: Props) => {
  const { t } = useLocale('charts');
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ChartCard href="/charts/near-price" title={t('nearPrice.miniTitle')}>
        <ErrorSuspense fallback={<PriceChartMini loading />}>
          <PriceChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/market-cap" title={t('marketCap.miniTitle')}>
        <ErrorSuspense fallback={<MarketCapChartMini loading />}>
          <MarketCapChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/near-supply" title={t('nearSupply.miniTitle')}>
        <ErrorSuspense fallback={<SupplyChartMini loading />}>
          <SupplyChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/txns" title={t('txns.miniTitle')}>
        <ErrorSuspense fallback={<TxnsChartMini loading />}>
          <TxnsChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/blocks" title={t('blocks.miniTitle')}>
        <ErrorSuspense fallback={<BlocksChartMini loading />}>
          <BlocksChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/addresses" title={t('addresses.miniTitle')}>
        <ErrorSuspense fallback={<AddressesChartMini loading />}>
          <AddressesChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/txn-fee" title={t('txnFee.miniTitle')}>
        <ErrorSuspense fallback={<TxnFeeChartMini loading />}>
          <TxnFeeChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
      <ChartCard href="/charts/txn-volume" title={t('txnVolume.miniTitle')}>
        <ErrorSuspense fallback={<TxnVolumeChartMini loading />}>
          <TxnVolumeChartMini statsPromise={statsPromise} />
        </ErrorSuspense>
      </ChartCard>
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
        <Label htmlFor="log-switch">{t('logView')}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <RiQuestionLine className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{t('logViewTip')}</TooltipContent>
        </Tooltip>
      </span>
    </CardHeader>
  );
};
