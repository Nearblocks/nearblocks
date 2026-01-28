'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountNFTTxn,
  AccountNFTTxnCount,
  AccountNFTTxnsRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { TokenImage } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirection, TxnStatusIcon } from '@/components/txn';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  nftCountPromise?: Promise<AccountNFTTxnCount | null>;
  nftsPromise?: Promise<AccountNFTTxnsRes>;
};

export const NFTTxns = ({ loading, nftCountPromise, nftsPromise }: Props) => {
  const nfts = !loading && nftsPromise ? use(nftsPromise) : null;
  const nftCount = !loading && nftCountPromise ? use(nftCountPromise) : null;

  const { address, tab } = useParams<{ address: string; tab: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}/${tab}?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}/${tab}?${params.toString()}`);
  };

  const columns: DataTableColumnDef<AccountNFTTxn>[] = [
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
      header: 'Txn Hash',
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
      enableFilter: true,
      filterName: 'cause',
      header: 'Method',
      id: 'cause',
    },
    {
      cell: (nft) => <AccountLink account={nft.affected_account_id} />,
      header: 'Affected',
      id: 'affected',
    },
    {
      cell: (nft) => <TxnDirection amount={nft.delta_amount} />,
      className: 'w-20',
      header: '',
      id: 'direction',
    },
    {
      cell: (nft) => <AccountLink account={nft.involved_account_id} />,
      enableFilter: true,
      filterName: 'involved',
      header: 'Involved',
      id: 'involved',
    },
    {
      cell: (nft) => (
        <Link
          className="text-link"
          href={`/nft-token/${nft.contract_account_id}/${nft.token_id}`}
        >
          <Truncate>
            <TruncateText text={nft.token_id} />
            <TruncateCopy text={nft.token_id} />
          </Truncate>
        </Link>
      ),
      header: 'Token ID',
      id: 'token_id',
    },
    {
      cell: (nft) => (
        <span className="flex items-center gap-1">
          <TokenImage
            alt={nft.meta?.name ?? ''}
            className="m-px size-5 rounded-full border"
            src={nft.meta?.icon ?? ''}
          />
          <Link
            className="text-link"
            href={`/nft-token/${nft.contract_account_id}`}
          >
            <Truncate>
              <TruncateText text={nft.contract_account_id} />
              <TruncateCopy text={nft.contract_account_id} />
            </Truncate>
          </Link>
        </span>
      ),
      enableFilter: true,
      filterName: 'token',
      header: 'Token',
      id: 'token',
    },
    {
      cell: (nft) =>
        nft.block?.block_timestamp ? (
          <TimestampCell ns={nft.block.block_timestamp} />
        ) : (
          <Skeleton className="w-30" />
        ),
      className: 'w-42',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  return (
    <Card>
      <CardHeader className="text-body-sm border-b py-3">
        <SkeletonSlot
          fallback={<Skeleton className="w-40" />}
          loading={loading || !nftCount}
        >
          {() => (
            <>{`A total of ${numberFormat(
              nftCount?.count ?? 0,
            )} nft token txns found`}</>
          )}
        </SkeletonSlot>
      </CardHeader>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={nfts?.data}
          emptyMessage="No nft token txns found"
          getRowKey={(nft) => `${nft.receipt_id}-${nft.event_index}`}
          loading={loading || !!nfts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={(type, cursor) =>
            `/address/${address}/${tab}?${type}=${cursor}`
          }
          pagination={nfts?.meta}
        />
      </CardContent>
    </Card>
  );
};
