'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { NFTContractTxnCountRes, NFTContractTxnsRes, NFTTxn } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import {
  MethodBadge,
  TxnDirectionIcon,
  TxnDirectionSkeleton,
  TxnStatusIcon,
} from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, isApproxCount } from '@/lib/format';
import { buildParams, encodeToken } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnCountPromise?: Promise<NFTContractTxnCountRes>;
  txnsPromise?: Promise<NFTContractTxnsRes>;
};

export const NftTokenTransfers = ({
  loading,
  txnCountPromise,
  txnsPromise,
}: Props) => {
  const { t } = useLocale('nfts');
  const nfts = !loading && txnsPromise ? use(txnsPromise) : null;
  if (nfts?.errors?.length) throw new Error('Failed to load transfers');
  const nftCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const columns: DataTableColumnDef<NFTTxn>[] = [
    {
      cell: () => <TxnStatusIcon status />,
      className: 'w-12',
      header: '',
      id: 'status',
      skeletonCell: <Skeleton className="size-5 rounded-full" />,
    },
    {
      cell: (nft) =>
        nft.transaction_hash ? (
          <Link className="text-link" href={`/txns/${nft.transaction_hash}`}>
            <Truncate>
              <TruncateText text={nft.transaction_hash} />
              <TruncateCopy text={nft.transaction_hash} />
            </Truncate>
          </Link>
        ) : (
          <Skeleton className="w-30" />
        ),
      header: t('transfers.columns.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (nft) => <MethodBadge text={nft.cause} />,
      header: t('transfers.columns.type'),
      id: 'type',
      skeletonCell: <Skeleton className="h-4.5 w-[75px] rounded-md" />,
    },
    {
      cell: (nft) => (
        <AccountLink
          account={
            nft.cause === 'BURN'
              ? nft.affected_account_id
              : nft.involved_account_id
          }
        />
      ),
      header: t('transfers.columns.from'),
      id: 'from',
    },
    {
      cell: () => <TxnDirectionIcon />,
      className: 'w-12',
      header: '',
      id: 'direction',
      skeletonCell: <TxnDirectionSkeleton />,
    },
    {
      cell: (nft) => (
        <AccountLink
          account={nft.cause === 'BURN' ? null : nft.affected_account_id}
        />
      ),
      header: t('transfers.columns.to'),
      id: 'to',
    },
    {
      cell: (nft) => (
        <Link
          className="text-link"
          href={`/nft-tokens/${nft.contract_account_id}/tokens/${encodeToken(
            nft.token_id,
          )}`}
        >
          <Truncate>
            <TruncateText text={nft.token_id} />
            <TruncateCopy text={nft.token_id} />
          </Truncate>
        </Link>
      ),
      header: t('transfers.columns.tokenId'),
      id: 'token_id',
    },
    {
      cell: (nft) => <TimestampCell ns={nft.block_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={nfts?.data}
          emptyMessage={t('transfers.empty')}
          getRowKey={(nft) => `${nft.receipt_id}-${nft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!!loading}
            >
              {() => {
                const count = nftCount?.data?.count;
                if (!count || count === '0') return null;
                return (
                  <>
                    {t(
                      isApproxCount(count)
                        ? 'transfers.total'
                        : 'transfers.totalExact',
                      { count: countFormat(count) },
                    )}
                  </>
                );
              }}
            </SkeletonSlot>
          }
          loading={!!loading}
          onPaginationNavigate={onPaginate}
          pagination={nfts?.meta}
        />
      </CardContent>
    </Card>
  );
};
