'use client';

import Big from 'big.js';
import { useEffect, useState } from 'react';

import type { ValidatorInfo } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  info?: null | ValidatorInfo;
  loading?: boolean;
};

export const secondsToTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, '0')}H ${String(m).padStart(
    2,
    '0',
  )}M ${String(s).padStart(2, '0')}S`;
};

export const EpochInfo = ({ info, loading }: Props) => {
  const { t } = useLocale('validators');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    if (info) {
      const epochStartMs = Number(info.epoch_start_timestamp ?? 0) / 1e6;
      const latestBlockMs = Number(info.latest_block_timestamp ?? 0) / 1e6;

      const elapsedSeconds = Math.max(0, (Date.now() - epochStartMs) / 1000);

      const blocksElapsed =
        Number(info.latest_block_height ?? 0) -
        Number(info.epoch_start_height ?? 0);
      const epochLength = info.protocol_epoch_length ?? 0;
      const pct = epochLength > 0 ? (blocksElapsed / epochLength) * 100 : 0;

      const elapsedSinceEpochMs = latestBlockMs - epochStartMs;
      const remainingSeconds =
        pct > 0 ? ((elapsedSinceEpochMs / pct) * (100 - pct)) / 1000 : 0;

      setElapsedTime(elapsedSeconds);
      setTimeRemaining(Math.max(0, remainingSeconds));
      setProgressPct(pct);
    }
  }, [info]);

  useEffect(() => {
    const id = setInterval(
      () => setTimeRemaining((t) => Math.max(t - 1, 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [info]);

  useEffect(() => {
    const id = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [info]);

  return (
    <Card className="md:col-span-2 xl:col-auto">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('epochInfo.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft>{t('epochInfo.epochElapsed')}</ListLeft>
            <ListRight className="font-mono">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                secondsToTime(Math.floor(elapsedTime))
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('epochInfo.nextEpochEta')}</ListLeft>
            <ListRight className="font-mono">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                secondsToTime(Math.floor(timeRemaining))
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('epochInfo.lastEpochApy')}</ListLeft>
            <ListRight>
              {loading ? (
                <Skeleton className="h-4 w-12" />
              ) : info?.last_epoch_apy ? (
                `${info.last_epoch_apy}%`
              ) : (
                '0%'
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('epochInfo.progress')}</ListLeft>
            <ListRight>
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : info != null ? (
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-2 w-28 rounded-full">
                    <div
                      className="bg-link h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          Number(Big(progressPct).toFixed(1)),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <span>{Big(progressPct).toFixed(0)}%</span>
                </div>
              ) : null}
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
