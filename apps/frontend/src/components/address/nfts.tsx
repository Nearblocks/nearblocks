'use client';

import { Download } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountNFTTxn,
  AccountNFTTxnCount,
  AccountNFTTxnsRes,
} from 'nb-schemas';
import { ExportType } from 'nb-types';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { TokenImage, TokenLink } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirection, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, numberFormat } from '@/lib/format';
import { buildParams, encodeToken } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  address?: string;
  basePath?: string;
  loading?: boolean;
  nftCountPromise?: Promise<AccountNFTTxnCount | null>;
  nftsPromise?: Promise<AccountNFTTxnsRes>;
};

export const NFTTxns = ({
  address: addressProp,
  basePath,
  loading,
  nftCountPromise,
  nftsPromise,
}: Props) => {
  const { t } = useLocale('address');
  const nfts = !loading && nftsPromise ? use(nftsPromise) : null;
  const nftCount = !loading && nftCountPromise ? use(nftCountPromise) : null;

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
      header: t('nfts.columns.txnHash'),
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
      filterPlaceholder: t('nfts.filterMethod'),
      header: t('nfts.columns.method'),
      id: 'cause',
    },
    {
      cell: (nft) => <AccountLink account={nft.affected_account_id} />,
      header: t('nfts.columns.affected'),
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
      filterPlaceholder: t('nfts.filterInvolved'),
      header: t('nfts.columns.involved'),
      id: 'involved',
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
      enableFilter: true,
      filterName: 'contract',
      filterPlaceholder: t('nfts.filterToken'),
      header: t('nfts.columns.tokenId'),
      id: 'token',
    },
    {
      cell: (nft) => (
        <span className="flex items-center gap-1">
          <TokenImage
            alt={nft.meta?.name ?? ''}
            className="m-px size-5 rounded-full border"
            src={nft.meta?.icon ?? ''}
          />
          <TokenLink
            contract={nft.contract_account_id}
            name={nft.meta?.name}
            type="nft-tokens"
          />
        </span>
      ),
      enableFilter: true,
      filterName: 'contract',
      filterPlaceholder: t('nfts.filterContract'),
      header: t('nfts.columns.token'),
      id: 'contract',
    },
    {
      cell: (nft) =>
        nft.block?.block_timestamp ? (
          <TimestampCell ns={nft.block.block_timestamp} />
        ) : (
          <Skeleton className="w-30" />
        ),
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const params = useParams<{ address?: string }>();
  const resolvedAddress = addressProp ?? params.address ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = basePath ?? `/address/${resolvedAddress}/nft-tokens`;

  const onFilter = (value: FilterData) => {
    const p = buildParams(searchParams, value);
    router.push(`${base}?${p.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const p = buildParams(searchParams, data);
    router.push(`${base}?${p.toString()}`);
  };

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const p = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${base}?${p.toString()}`;
  };

  const accountFilter = basePath ? searchParams.get('account') : null;
  const extraFilters = accountFilter
    ? [
        {
          label: t('txns.columns.account'),
          name: 'account',
          value: accountFilter,
        },
      ]
    : undefined;

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          actions={
            !basePath && (
              <Button asChild size="xs" variant="outline">
                <Link
                  href={`/export-csv?account=${resolvedAddress}&type=${ExportType.NFT_TRANSFERS}`}
                >
                  <Download className="size-3" />
                  {t('csvExport')}
                </Link>
              </Button>
            )
          }
          columns={columns}
          data={nfts?.data}
          emptyMessage={t('nfts.empty')}
          extraFilters={extraFilters}
          getRowKey={(nft) => `${nft.receipt_id}-${nft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !nftCount}
            >
              {() => (
                <>
                  {basePath ? (
                    t('nfts.total', {
                      count: countFormat(nftCount?.count ?? 0),
                    })
                  ) : nfts?.data?.length ? (
                    t('nfts.latest', { count: numberFormat(nfts.data.length) })
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!nfts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={basePath ? nfts?.meta : undefined}
        />
        {!basePath && nfts?.meta?.next_page && (
          <div className="border-t px-4 py-3">
            <Button asChild className="h-8 w-full" variant="ghost">
              <Link href={`/nft-tokens/transfers?account=${resolvedAddress}`}>
                {t('nfts.viewAll')}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
