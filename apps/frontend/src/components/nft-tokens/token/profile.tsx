'use client';

import { use } from 'react';

import { NFTContractRes } from 'nb-schemas';

import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  cid: string;
  contractPromise?: Promise<NFTContractRes>;
  loading?: boolean;
};

export const Profile = ({ cid, contractPromise, loading }: Props) => {
  const { t } = useLocale('nfts');
  // Suspend until the contract resolves so this card streams in with its data.
  if (!loading && contractPromise) void use(contractPromise);

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('contract.profile.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-28">
              {t('contract.profile.contract')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={
                  <span className="block">
                    <Skeleton className="w-40" />
                  </span>
                }
                loading={!!loading}
              >
                {() => <AccountLink account={cid} textClassName="max-w-60" />}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
