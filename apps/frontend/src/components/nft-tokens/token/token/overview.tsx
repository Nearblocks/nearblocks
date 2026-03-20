'use client';

import { use } from 'react';

import { NFTContractRes, NFTTokenRes } from 'nb-schemas';

import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { NFTMedia } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  cid: string;
  contractPromise?: Promise<NFTContractRes>;
  loading?: boolean;
  tokenPromise?: Promise<NFTTokenRes>;
};

export const NftOverview = ({
  cid,
  contractPromise,
  loading,
  tokenPromise,
}: Props) => {
  const { t } = useLocale('nfts');
  const tokenRes = !loading && tokenPromise ? use(tokenPromise) : null;
  const contractRes = !loading && contractPromise ? use(contractPromise) : null;
  const token = tokenRes?.data ?? null;
  const contract = contractRes?.data ?? null;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg">
        <SkeletonSlot
          fallback={<Skeleton className="aspect-square w-full rounded-lg" />}
          loading={loading || !token}
        >
          {() => (
            <NFTMedia
              alt={token?.title ?? token?.token ?? ''}
              base={contract?.base_uri ?? null}
              className="h-full w-full object-cover"
              media={token?.media ?? null}
              reference={token?.reference ?? null}
            />
          )}
        </SkeletonSlot>
      </div>
      <Card className="lg:col-span-2">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-headline-sm">
            {t('token.overview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <List pairsPerRow={1}>
            <ListItem>
              <ListLeft className="min-w-40">{t('token.owner')}</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="h-5 w-40" />}
                  loading={loading || !token}
                >
                  {() => (
                    <AccountLink
                      account={token?.owner ?? null}
                      textClassName="max-w-60"
                    />
                  )}
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-40">{t('token.contract')}</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="h-5 w-40" />}
                  loading={loading || !token}
                >
                  {() => <AccountLink account={cid} textClassName="max-w-60" />}
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-40">{t('token.tokenId')}</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="h-5 w-24" />}
                  loading={loading || !token}
                >
                  {() => <span className="text-body-sm">{token?.token}</span>}
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-40">{t('token.standard')}</ListLeft>
              <ListRight>
                <span className="text-body-sm">{t('token.nep171')}</span>
              </ListRight>
            </ListItem>
            {(loading || token?.description) && (
              <ListItem>
                <ListLeft className="min-w-40">
                  {t('token.description')}
                </ListLeft>
                <ListRight>
                  <SkeletonSlot
                    fallback={<Skeleton className="h-5 w-48" />}
                    loading={loading || !token}
                  >
                    {() => (
                      <span className="text-body-sm">{token?.description}</span>
                    )}
                  </SkeletonSlot>
                </ListRight>
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};
