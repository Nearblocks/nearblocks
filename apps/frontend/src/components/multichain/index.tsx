'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';

import { MCTxn, MCTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  loading?: boolean;
  txnsPromise?: Promise<MCTxnsRes>;
};

type ChainExplorer = {
  addrUrl: string;
  icon: string;
  name: string;
  txUrl: string;
};

const CHAIN_EXPLORERS: Record<string, ChainExplorer> = {
  ARBITRUM: {
    addrUrl: 'https://arbiscan.io/address/',
    icon: '/images/icons/arb.svg',
    name: 'Arbitrum',
    txUrl: 'https://arbiscan.io/tx/',
  },
  AURORA: {
    addrUrl: 'https://explorer.aurora.dev/address/',
    icon: '/images/icons/aurora.svg',
    name: 'Aurora',
    txUrl: 'https://explorer.aurora.dev/tx/',
  },
  BASE: {
    addrUrl: 'https://basescan.org/address/',
    icon: '/images/icons/base.svg',
    name: 'Base',
    txUrl: 'https://basescan.org/tx/',
  },
  BITCOIN: {
    addrUrl: 'https://mempool.space/address/',
    icon: '/images/icons/btc.svg',
    name: 'Bitcoin',
    txUrl: 'https://mempool.space/tx/',
  },
  BSC: {
    addrUrl: 'https://bscscan.com/address/',
    icon: '/images/icons/bsc.svg',
    name: 'BSC',
    txUrl: 'https://bscscan.com/tx/',
  },
  ETHEREUM: {
    addrUrl: 'https://etherscan.io/address/',
    icon: '/images/icons/eth.svg',
    name: 'Ethereum',
    txUrl: 'https://etherscan.io/tx/',
  },
  GNOSIS: {
    addrUrl: 'https://gnosisscan.io/address/',
    icon: '/images/icons/gno.svg',
    name: 'Gnosis',
    txUrl: 'https://gnosisscan.io/tx/',
  },
  OPTIMISM: {
    addrUrl: 'https://optimistic.etherscan.io/address/',
    icon: '/images/icons/op.svg',
    name: 'Optimism',
    txUrl: 'https://optimistic.etherscan.io/tx/',
  },
  POLYGON: {
    addrUrl: 'https://polygonscan.com/address/',
    icon: '/images/icons/pol.svg',
    name: 'Polygon',
    txUrl: 'https://polygonscan.com/tx/',
  },
  SOLANA: {
    addrUrl: 'https://solscan.io/address/',
    icon: '/images/icons/sol.svg',
    name: 'Solana',
    txUrl: 'https://solscan.io/tx/',
  },
};

const ChainIcon = ({ icon, name }: { icon: string; name: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Image
        alt={name}
        className="size-4 rounded-sm"
        height={16}
        src={icon}
        width={16}
      />
    </TooltipTrigger>
    <TooltipContent>{name}</TooltipContent>
  </Tooltip>
);

export const MultichainTxns = ({ loading, txnsPromise }: Props) => {
  const { t } = useLocale('multichain');
  const searchParams = useSearchParams();
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;

  const columns: DataTableColumnDef<MCTxn>[] = [
    {
      cell: (txn) => (
        <Link
          className="text-link"
          href={`/txns/${txn.transaction_hash}/execution#${txn.receipt_id}`}
        >
          <Truncate>
            <TruncateText text={txn.receipt_id} />
            <TruncateCopy text={txn.receipt_id} />
          </Truncate>
        </Link>
      ),
      header: t('list.receiptId'),
      id: 'receipt_id',
    },
    {
      cell: (txn) =>
        txn.transaction_hash ? (
          <Link className="text-link" href={`/txns/${txn.transaction_hash}`}>
            <Truncate>
              <TruncateText text={txn.transaction_hash} />
              <TruncateCopy text={txn.transaction_hash} />
            </Truncate>
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      header: t('list.sourceTxn'),
      id: 'source_txn',
    },
    {
      cell: (txn) => <AccountLink account={txn.account_id} />,
      header: t('list.from'),
      id: 'from',
    },
    {
      cell: (txn) => {
        const explorer = txn.dest_chain
          ? CHAIN_EXPLORERS[txn.dest_chain]
          : null;
        if (txn.dest_txn && explorer) {
          return (
            <Truncate>
              <ChainIcon icon={explorer.icon} name={explorer.name} />
              <a
                className="text-link ml-2 flex"
                href={`${explorer.txUrl}${txn.dest_txn}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <TruncateText text={txn.dest_txn} />
              </a>
              <TruncateCopy text={txn.dest_txn} />
            </Truncate>
          );
        }
        return (
          <span className="text-muted-foreground italic">
            {t('list.notIndexed')}
          </span>
        );
      },
      header: t('list.destTxn'),
      id: 'dest_txn',
    },
    {
      cell: (txn) => {
        const explorer = txn.dest_chain
          ? CHAIN_EXPLORERS[txn.dest_chain]
          : null;
        if (txn.dest_address && explorer) {
          return (
            <Truncate>
              <ChainIcon icon={explorer.icon} name={explorer.name} />
              <a
                className="text-link ml-2 flex"
                href={`${explorer.addrUrl}${txn.dest_address}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <TruncateText text={txn.dest_address} />
              </a>
              <TruncateCopy text={txn.dest_address} />
            </Truncate>
          );
        }
        return (
          <span className="text-muted-foreground italic">
            {t('list.notIndexed')}
          </span>
        );
      },
      header: t('list.destAddress'),
      id: 'dest_address',
    },
    {
      cell: (txn) => (
        <Link className="text-link" href={`/blocks/${txn.block?.block_hash}`}>
          {numberFormat(txn.block?.block_height)}
        </Link>
      ),
      header: t('list.blockHeight'),
      id: 'block_height',
    },
    {
      cell: (txn) => <TimestampCell ns={txn.block_timestamp} />,
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
    return `/multichain-txns?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={txns?.data}
          emptyMessage={t('list.empty')}
          getRowKey={(txn) => `${txn.receipt_id}-${txn.event_index}`}
          loading={loading || !!txns?.errors}
          onPaginationNavigate={onPaginate}
          pagination={txns?.meta}
        />
      </CardContent>
    </Card>
  );
};
