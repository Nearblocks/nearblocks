'use client';

import { use } from 'react';

import type { Validator } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  validatorPromise?: Promise<null | Validator>;
};

export const Overview = ({ loading, validatorPromise }: Props) => {
  const { t } = useLocale('validators');
  const validator = !loading && validatorPromise ? use(validatorPromise) : null;

  const fee =
    validator?.fee_numerator != null && validator?.fee_denominator
      ? ((validator.fee_numerator / validator.fee_denominator) * 100).toFixed(
          2,
        ) + '%'
      : null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('nodeDetails.overview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-20">
              {t('nodeDetails.totalStake')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-24" />}
                loading={!!loading}
              >
                {() =>
                  validator?.current_epoch_stake ? (
                    <span className="flex items-center gap-1">
                      <NearCircle className="size-4 shrink-0" />
                      {nearFormat(validator.current_epoch_stake)}
                    </span>
                  ) : (
                    '-'
                  )
                }
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('nodeDetails.delegators')}</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-16" />}
                loading={!!loading}
              >
                {() =>
                  validator?.delegators_count != null
                    ? numberFormat(validator.delegators_count)
                    : '-'
                }
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('nodeDetails.fee')}</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-16" />}
                loading={!!loading}
              >
                {() => fee ?? '-'}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
