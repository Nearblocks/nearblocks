'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { NFTTokenTxn, NFTTokenTxnCountRes, NFTTokenTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnCountPromise?: Promise<NFTTokenTxnCountRes>;
  txnsPromise?: Promise<NFTTokenTxnsRes>;
};

export const NftTransfers = ({
  loading,
  txnCountPromise,
  txnsPromise,
}: Props) => {
  const { t } = useLocale('nfts');
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const txnColumns: DataTableColumnDef<NFTTokenTxn>[] = [
    {
      cell: () => <TxnStatusIcon status />,
      className: 'w-5',
      header: '',
      id: 'status',
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
      header: t('tokenTransfers.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (nft) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText className="max-w-20" text={nft.cause} />
          </Truncate>
        </Badge>
      ),
      header: t('tokenTransfers.method'),
      id: 'method',
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
      header: t('tokenTransfers.from'),
      id: 'from',
    },
    {
      cell: () => <TxnDirectionIcon />,
      className: 'w-12',
      header: '',
      id: 'direction',
    },
    {
      cell: (nft) => (
        <AccountLink
          account={nft.cause === 'BURN' ? null : nft.affected_account_id}
        />
      ),
      header: t('tokenTransfers.to'),
      id: 'to',
    },
    {
      cell: (nft) =>
        nft.block?.block_height ? (
          <Link
            className="text-link"
            href={`/blocks/${nft.block.block_height}`}
          >
            {numberFormat(nft.block.block_height)}
          </Link>
        ) : (
          <Skeleton className="w-20" />
        ),
      header: t('tokenTransfers.block'),
      id: 'block',
    },
    {
      cell: (nft) =>
        nft.block?.block_timestamp ? (
          <TimestampCell ns={nft.block.block_timestamp} />
        ) : (
          <Skeleton className="w-20" />
        ),
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Card className="mt-10">
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={txnColumns}
          data={txns?.data}
          emptyMessage={t('tokenTransfers.empty')}
          getRowKey={(nft) => `${nft.receipt_id}-${nft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !txnCount}
            >
              {() => (
                <>
                  {t('tokenTransfers.total', {
                    count: numberFormat(txnCount?.data?.count ?? 0),
                  })}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!txns?.errors}
          onPaginationNavigate={onPaginate}
          pagination={txns?.meta}
        />
      </CardContent>
    </Card>
  );
};
