'use client';

import dayjs from 'dayjs';
// import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { RiQuestionLine } from 'react-icons/ri';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { BalanceChart } from './balance';
import { Heatmap } from './heatmap';
import { NearChart } from './near';
import { TokenChart } from './token';
import { TxnsChart } from './txns';

const generateSampleData = () => {
  const end = dayjs().subtract(1, 'day');
  const start = dayjs('2025-02-01');
  const daysDiff = end.diff(start, 'day');
  const data: Array<{ date: Date; value: number }> = [];

  for (let i = 0; i <= daysDiff; i += 1) {
    const date = start.add(i, 'day');
    const dayOfWeek = date.day();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const seasonal = Math.sin((i / 365) * Math.PI * 2) * 0.5 + 0.5;
    const weekdayBoost = isWeekend ? 0.4 : 1;
    const wave = Math.sin(i / 7) * 0.35 + 0.65;

    const value = Math.max(0, Math.round(25 * seasonal * weekdayBoost * wave));

    data.push({ date: date.toDate(), value });
  }

  return {
    data,
    rangeLabel: `${start.format('ddd D, MMM YYYY')} - ${end.format(
      'ddd D, MMM YYYY',
    )}`,
  };
};
export const Analytics = () => {
  // const { address } = useParams();
  const { data, rangeLabel } = useMemo(() => generateSampleData(), []);

  return (
    <Card>
      <CardContent className="text-body-sm p-3">
        <Tabs defaultValue="overview">
          <ScrollArea className="w-full pb-3 whitespace-nowrap">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
              <TabsTrigger value="txns">Transactions</TabsTrigger>
              <TabsTrigger value="near-txns">Near Transfers</TabsTrigger>
              <TabsTrigger value="token-txns">Token Transfers</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <TabsContent value="overview">
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Card className="px-3 py-3">
                <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
                  Transaction Count{' '}
                  <Tooltip>
                    <TooltipTrigger>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Count of normal transactions, internal transactions and
                      token transfers involving this address
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-headline-base mt-0.5">10,148,542</p>
                <p className="text-body-xs text-muted-foreground mt-2">
                  Since Tue 04, Apr 2023
                </p>
              </Card>
              <Card className="px-3 py-3">
                <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
                  Active Age{' '}
                  <Tooltip>
                    <TooltipTrigger>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Number of days since the first transaction involving this
                      address as either a sender or recipient
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-headline-base mt-0.5">2 Years 292 Days</p>
                <p className="text-body-xs text-muted-foreground mt-2">
                  Since Tue 04, Apr 2023
                </p>
              </Card>
              <Card className="px-3 py-3">
                <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
                  Unique Days Active{' '}
                  <Tooltip>
                    <TooltipTrigger>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Number of days this address has had activity onchain
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-headline-base mt-0.5">2 Years 100 Days</p>
                <p className="text-body-xs text-muted-foreground mt-2">
                  Since Tue 04, Apr 2023
                </p>
              </Card>
              <Card className="px-3 py-3">
                <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
                  Longest Streak{' '}
                  <Tooltip>
                    <TooltipTrigger>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Longest streak of consecutive days with onchain activity
                      for this address
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-headline-base mt-0.5">1 Years 5 Days</p>
                <p className="text-body-xs text-muted-foreground mt-2">
                  Since Tue 04, Apr 2023
                </p>
              </Card>
            </div>
            <Card>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-headline-sm">
                  Transaction Heatmap
                </CardTitle>
                <span className="text-muted-foreground">{rangeLabel}</span>
              </CardHeader>
              <CardContent className="h-47 pt-3">
                <Heatmap data={data} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="balance">
            <BalanceChart data={[]} />
          </TabsContent>
          <TabsContent value="txns">
            <TxnsChart data={[]} />
          </TabsContent>
          <TabsContent value="near-txns">
            <NearChart data={[]} />
          </TabsContent>
          <TabsContent value="token-txns">
            <TokenChart data={[]} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
