'use client';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { useValidator } from '@/hooks/use-validator';
import { numberFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  node: string;
};

const statusVariant = (
  status: string,
): 'amber' | 'blue' | 'gray' | 'lime' | 'red' => {
  switch (status) {
    case 'active':
      return 'lime';
    case 'joining':
    case 'proposal':
      return 'amber';
    case 'leaving':
      return 'red';
    default:
      return 'gray';
  }
};

const uptimeVariant = (ratio: number): 'amber' | 'gray' | 'lime' | 'red' => {
  if (ratio >= 90) return 'lime';
  if (ratio >= 70) return 'amber';
  return 'red';
};

export const Uptime = ({ node }: Props) => {
  const { t } = useLocale('validators');
  const { currentValidator, isLoading, status } = useValidator(node);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('table.statuses.active');
      case 'joining':
        return t('table.statuses.joining');
      case 'leaving':
        return t('table.statuses.kickout');
      case 'proposal':
        return t('table.statuses.proposal');
      case 'idle':
        return t('table.statuses.idle');
      default:
        return status;
    }
  };

  const blocksProduced = currentValidator?.numProducedBlocks ?? 0;
  const blocksExpected = currentValidator?.numExpectedBlocks ?? 0;
  const chunksProduced = currentValidator?.numProducedChunks ?? 0;
  const chunksExpected = currentValidator?.numExpectedChunks ?? 0;

  const blocksRatio =
    blocksExpected > 0 ? (blocksProduced / blocksExpected) * 100 : 0;
  const chunksRatio =
    chunksExpected > 0 ? (chunksProduced / chunksExpected) * 100 : 0;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('nodeDetails.uptimeInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-20">{t('nodeDetails.status')}</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="h-5 w-16" />}
                loading={isLoading}
              >
                {() =>
                  status ? (
                    <Badge
                      className="text-body-xs px-1.5 py-0.5"
                      variant={statusVariant(status)}
                    >
                      {statusLabel(status)}
                    </Badge>
                  ) : (
                    '-'
                  )
                }
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('nodeDetails.blocks')}</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={
                  <span className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <span className="block">
                      <Skeleton className="w-40" />
                    </span>
                  </span>
                }
                loading={isLoading}
              >
                {() => (
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge
                      className="text-body-xs px-1.5 py-0.5"
                      variant={uptimeVariant(blocksRatio)}
                    >
                      {blocksRatio.toFixed(2)} %
                    </Badge>
                    <span className="text-muted-foreground">
                      {t('nodeDetails.producedExpected', {
                        expected: numberFormat(blocksExpected),
                        produced: numberFormat(blocksProduced),
                      })}
                    </span>
                  </span>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('nodeDetails.chunks')}</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={
                  <span className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <span className="block">
                      <Skeleton className="w-40" />
                    </span>
                  </span>
                }
                loading={isLoading}
              >
                {() => (
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge
                      className="text-body-xs px-1.5 py-0.5"
                      variant={uptimeVariant(chunksRatio)}
                    >
                      {chunksRatio.toFixed(2)} %
                    </Badge>
                    <span className="text-muted-foreground">
                      {t('nodeDetails.producedExpected', {
                        expected: numberFormat(chunksExpected),
                        produced: numberFormat(chunksProduced),
                      })}
                    </span>
                  </span>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
