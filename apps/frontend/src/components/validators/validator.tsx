'use client';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { useSeatInfo } from '@/hooks/use-seat-info';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
};

export const ValidatorInfo = ({ loading }: Props) => {
  const { t } = useLocale('validators');
  const {
    currentSeatPrice,
    isLoading: seatLoading,
    nextSeatPrice,
    protocolVersion,
  } = useSeatInfo();

  const isLoading = loading || seatLoading;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('validatorInfo.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft>{t('validatorInfo.protocolVersion')}</ListLeft>
            <ListRight>
              {isLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                numberFormat(protocolVersion ?? undefined)
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('validatorInfo.nextSeatPrice')}</ListLeft>
            <ListRight>
              {isLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : nextSeatPrice !== null ? (
                <span className="flex items-center gap-1">
                  <NearCircle className="size-4" />
                  {nearFormat(nextSeatPrice.toString(), {
                    maximumFractionDigits: 0,
                  })}
                </span>
              ) : (
                ''
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('validatorInfo.currentSeatPrice')}</ListLeft>
            <ListRight>
              {isLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : currentSeatPrice !== null ? (
                <span className="flex items-center gap-1">
                  <NearCircle className="size-4" />
                  {nearFormat(currentSeatPrice.toString(), {
                    maximumFractionDigits: 0,
                  })}
                </span>
              ) : (
                ''
              )}
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
