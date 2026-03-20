'use client';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import type { ValidatorsRes } from '@/data/validators';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  totalSupply?: null | string;
  validators?: null | ValidatorsRes;
};

export const StakingOverview = ({
  loading,
  totalSupply,
  validators,
}: Props) => {
  const { t } = useLocale('validators');

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">{t('staking.title')}</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft>{t('staking.currentValidators')}</ListLeft>
            <ListRight>
              {loading ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                numberFormat(validators?.currentValidators)
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('staking.totalStaked')}</ListLeft>
            <ListRight>
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : validators?.totalStake ? (
                <span className="flex items-center gap-1">
                  <NearCircle className="size-4" />
                  {nearFormat(validators.totalStake, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              ) : (
                ''
              )}
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft>{t('staking.totalSupply')}</ListLeft>
            <ListRight>
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : totalSupply ? (
                <span className="flex items-center gap-1">
                  <NearCircle className="size-4" />
                  {totalSupply}{' '}
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
