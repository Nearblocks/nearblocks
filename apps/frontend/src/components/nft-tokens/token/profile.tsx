'use client';

import { use } from 'react';

import { NFTContractRes } from 'nb-schemas';

import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<NFTContractRes>;
  loading?: boolean;
  token: string;
};

export const Profile = ({ contractPromise, loading, token }: Props) => {
  const result = !loading && contractPromise ? use(contractPromise) : null;
  const contract = result?.data ?? null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">Profile Summary</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-28">Contract:</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="h-7 w-40" />}
                loading={loading || !contract}
              >
                {() => <AccountLink account={token} textClassName="max-w-60" />}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
