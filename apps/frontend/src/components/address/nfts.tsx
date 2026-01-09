'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountNFTTxn,
  AccountNFTTxnCount,
  AccountNFTTxnsRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimeAgo } from '@/components/time-ago';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnStatusIcon } from '@/components/txn-status';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';

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
      className: 'w-[20px]',
      header: '',
      id: 'status',
    },
    {
      cell: (nft) => (
        <Link className="text-link" href={`/nfts/${nft.receipt_id}`}>
          <Truncate>
            <TruncateText text={nft.transaction_hash ?? ''} />
            <TruncateCopy text={nft.transaction_hash ?? ''} />
          </Truncate>
        </Link>
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
      cell: (nft) => (
        <Link
          className="text-link"
          href={`/address/${nft.affected_account_id}`}
        >
          <Truncate>
            <TruncateText text={nft.affected_account_id} />
            <TruncateCopy text={nft.affected_account_id} />
          </Truncate>
        </Link>
      ),
      header: 'Affected',
      id: 'affected',
    },
    {
      cell: (nft) =>
        nft.involved_account_id ? (
          <Link
            className="text-link"
            href={`/address/${nft.involved_account_id}`}
          >
            <Truncate>
              <TruncateText text={nft.involved_account_id} />
              <TruncateCopy text={nft.involved_account_id} />
            </Truncate>
          </Link>
        ) : (
          'system'
        ),
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
        <Link
          className="text-link"
          href={`/nft-token/${nft.contract_account_id}`}
        >
          <Truncate>
            <TruncateText text={nft.contract_account_id} />
            <TruncateCopy text={nft.contract_account_id} />
          </Truncate>
        </Link>
      ),
      enableFilter: true,
      filterName: 'token',
      header: 'Token',
      id: 'token',
    },
    {
      cell: (nft) => <TimeAgo ns={nft.block?.block_timestamp} />,
      header: 'Age',
      id: 'age',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={nfts?.data}
      emptyMessage="No nft token txns found"
      getRowKey={(nft) => `${nft.receipt_id}-${nft.event_index}`}
      header={
        <>{`A total of ${numberFormat(
          nftCount?.count ?? 0,
        )} nft token txns found`}</>
      }
      loading={loading || !nftCount || !nftCount?.count}
      onClear={onClear}
      onFilter={onFilter}
      onPaginationNavigate={(type, page) =>
        `/address/${address}/${tab}?${type}=${page}`
      }
      pagination={nfts?.meta}
    />
  );
};
