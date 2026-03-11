'use client';

import Big from 'big.js';
import { useEffect, useState } from 'react';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import type { ValidatorsRes } from '@/data/node-explorer';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  validators?: null | ValidatorsRes;
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

export const EpochInfo = ({ loading, validators }: Props) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (validators) {
      setTimeRemaining(validators.totalSeconds ?? 0);
      setElapsedTime(validators.elapsedTimeData ?? 0);
    }
  }, [validators]);

  useEffect(() => {
    const id = setInterval(
      () => setTimeRemaining((t) => Math.max(t - 1, 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [validators]);

  useEffect(() => {
    const id = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [validators]);

  return (
    <Card className="md:col-span-2 xl:col-auto">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">Epoch Information</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft>Epoch Elapsed Time</ListLeft>
            <ListRight className="font-mono">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                secondsToTime(Math.floor(elapsedTime))
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>Next Epoch ETA</ListLeft>
            <ListRight className="font-mono">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                secondsToTime(Math.floor(timeRemaining))
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>Last Epoch APY</ListLeft>
            <ListRight>
              {loading ? (
                <Skeleton className="h-4 w-12" />
              ) : validators?.lastEpochApy ? (
                `${validators.lastEpochApy}%`
              ) : (
                '0%'
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>Progress</ListLeft>
            <ListRight>
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : validators != null ? (
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-2 w-28 rounded-full">
                    <div
                      className="bg-link h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          Number(
                            Big(validators.epochProgressData ?? 0).toFixed(1),
                          ),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <span>
                    {Big(validators.epochProgressData ?? 0).toFixed(0)}%
                  </span>
                </div>
              ) : null}
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
