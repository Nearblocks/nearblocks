'use client';

import type { ValidatorInfo as ValidatorInfoData } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  info?: null | ValidatorInfoData;
  loading?: boolean;
};

export const ValidatorInfo = ({ info, loading }: Props) => {
  const { t } = useLocale('validators');
  const currentSeatPrice = info?.epoch_seat_price ?? null;
  const nextSeatPrice = info?.next_epoch_seat_price ?? null;
  const protocolVersion = info?.protocol_version ?? null;

  const isLoading = loading;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('validatorInfo.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft>{t('validatorInfo.protocolVersion')}</ListLeft>
            <ListRight>
              {isLoading ? (
                <Skeleton className="w-20" />
              ) : protocolVersion != null ? (
                numberFormat(protocolVersion)
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('validatorInfo.nextSeatPrice')}</ListLeft>
            <ListRight>
              {isLoading ? (
                <Skeleton className="w-20" />
              ) : nextSeatPrice !== null ? (
                <span className="flex items-center gap-1">
                  <NearCircle className="size-4" />
                  {nearFormat(nextSeatPrice, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('validatorInfo.currentSeatPrice')}</ListLeft>
            <ListRight>
              {isLoading ? (
                <Skeleton className="w-20" />
              ) : currentSeatPrice !== null ? (
                <span className="flex items-center gap-1">
                  <NearCircle className="size-4" />
                  {nearFormat(currentSeatPrice, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
