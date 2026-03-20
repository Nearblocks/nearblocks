'use client';

import { NearRpcClient, validators } from '@near-js/jsonrpc-client';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import type { DataTableColumnDef } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { useView } from '@/hooks/use-rpc';
import { useSettings } from '@/hooks/use-settings';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { Copy } from '../copy';

const PAGE_SIZE = 25;

type DelegatorAccount = {
  account_id: string;
  can_withdraw: boolean;
  staked_balance: string;
  unstaked_balance: string;
};

type RewardFeeFraction = {
  denominator: number;
  numerator: number;
};

const statusVariant = (
  status: string,
): 'amber' | 'blue' | 'gray' | 'lime' | 'red' => {
  switch (status) {
    case 'active':
      return 'lime';
    case 'joining':
    case 'proposal':
      return 'amber';
    case 'leaving':
      return 'red';
    default:
      return 'gray';
  }
};

const uptimeVariant = (ratio: number): 'amber' | 'gray' | 'lime' | 'red' => {
  if (ratio >= 90) return 'lime';
  if (ratio >= 70) return 'amber';
  return 'red';
};

type Props = {
  node: string;
};

export const NodeDetails = ({ node }: Props) => {
  const { t } = useLocale('validators');
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const defaultProvider = useConfig((s) => s.config.provider);
  const rpcUrl = (provider || defaultProvider).url;

  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const fromIndex = (page - 1) * PAGE_SIZE;

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('table.statuses.active');
      case 'joining':
        return t('table.statuses.joining');
      case 'leaving':
        return t('table.statuses.kickout');
      case 'proposal':
        return t('table.statuses.proposal');
      case 'idle':
        return t('table.statuses.idle');
      default:
        return status;
    }
  };

  const columns: DataTableColumnDef<DelegatorAccount>[] = [
    {
      cell: (row) => <AccountLink account={row.account_id} />,
      className: 'w-[50%]',
      header: t('nodeDetails.columns.account'),
      id: 'account',
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4 shrink-0" />
          {nearFormat(row.staked_balance)}
        </span>
      ),
      header: t('nodeDetails.columns.stakedBalance'),
      id: 'staked_balance',
      skeletonWidth: 'w-28',
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4 shrink-0" />
          {nearFormat(row.unstaked_balance)}
        </span>
      ),
      header: t('nodeDetails.columns.unstakedBalance'),
      id: 'unstaked_balance',
      skeletonWidth: 'w-28',
    },
  ];

  const { data: validatorsData, isLoading: validatorsLoading } = useSWR(
    hydrated && rpcUrl ? ['node-validator-details', node, rpcUrl] : null,
    async () => {
      const client = new NearRpcClient({ endpoint: rpcUrl });
      return validators(client, 'latest');
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const { data: feeData, isLoading: feeLoading } = useView<RewardFeeFraction>({
    args: {},
    contract: node,
    method: 'get_reward_fee_fraction',
  });

  const { data: totalData, isLoading: totalLoading } = useView<string>({
    args: {},
    contract: node,
    method: 'get_number_of_accounts',
  });

  const { data: delegatorsData, isLoading: delegatorsLoading } = useView<
    DelegatorAccount[]
  >({
    args: { from_index: fromIndex, limit: PAGE_SIZE },
    contract: node,
    method: 'get_accounts',
  });

  const currentValidator = validatorsData?.currentValidators.find(
    (v) => v.accountId === node,
  );
  const nextValidator = validatorsData?.nextValidators.find(
    (v) => v.accountId === node,
  );
  const isProposal = validatorsData?.currentProposals.some(
    (v) => v.accountId === node,
  );

  const status = currentValidator
    ? nextValidator
      ? 'active'
      : 'leaving'
    : nextValidator
    ? 'joining'
    : isProposal
    ? 'proposal'
    : validatorsData
    ? 'idle'
    : null;

  const blocksProduced = currentValidator?.numProducedBlocks ?? 0;
  const blocksExpected = currentValidator?.numExpectedBlocks ?? 0;
  const chunksProduced = currentValidator?.numProducedChunks ?? 0;
  const chunksExpected = currentValidator?.numExpectedChunks ?? 0;

  const blocksRatio =
    blocksExpected > 0 ? (blocksProduced / blocksExpected) * 100 : 0;
  const chunksRatio =
    chunksExpected > 0 ? (chunksProduced / chunksExpected) * 100 : 0;

  const fee =
    feeData != null
      ? ((feeData.numerator / feeData.denominator) * 100).toFixed(2) + '%'
      : null;

  const total = totalData != null ? Number(totalData) : null;
  const hasNextPage = total != null && fromIndex + PAGE_SIZE < total;
  const hasPrevPage = page > 1;

  const isTopLoading = validatorsLoading || feeLoading;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <span className="text-muted-foreground text-body-sm">@{node}</span>
        <Copy text={node} />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-headline-sm">
              {t('nodeDetails.overview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <List pairsPerRow={1}>
              <ListItem>
                <ListLeft className="min-w-20">
                  {t('nodeDetails.status')}
                </ListLeft>
                <ListRight>
                  {isTopLoading ? (
                    <Skeleton className="h-5 w-16" />
                  ) : status ? (
                    <Badge variant={statusVariant(status)}>
                      {statusLabel(status)}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </ListRight>
              </ListItem>
              <ListItem>
                <ListLeft>{t('nodeDetails.fee')}</ListLeft>
                <ListRight>
                  {feeLoading ? <Skeleton className="h-4 w-16" /> : fee ?? '-'}
                </ListRight>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-headline-sm">
              {t('nodeDetails.uptimeInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <List pairsPerRow={1}>
              <ListItem>
                <ListLeft className="min-w-20">
                  {t('nodeDetails.blocks')}
                </ListLeft>
                <ListRight>
                  {validatorsLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge variant={uptimeVariant(blocksRatio)}>
                        {blocksRatio.toFixed(2)} %
                      </Badge>
                      <span className="text-muted-foreground">
                        {t('nodeDetails.producedExpected', {
                          expected: numberFormat(blocksExpected),
                          produced: numberFormat(blocksProduced),
                        })}
                      </span>
                    </span>
                  )}
                </ListRight>
              </ListItem>
              <ListItem>
                <ListLeft>{t('nodeDetails.chunks')}</ListLeft>
                <ListRight>
                  {validatorsLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge variant={uptimeVariant(chunksRatio)}>
                        {chunksRatio.toFixed(2)} %
                      </Badge>
                      <span className="text-muted-foreground">
                        {t('nodeDetails.producedExpected', {
                          expected: numberFormat(chunksExpected),
                          produced: numberFormat(chunksProduced),
                        })}
                      </span>
                    </span>
                  )}
                </ListRight>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={delegatorsData}
          getRowKey={(row) => row.account_id}
          header={
            totalLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : total != null ? (
              t('nodeDetails.delegatorsTotal', { count: numberFormat(total) })
            ) : undefined
          }
          loading={delegatorsLoading}
          onPaginationNavigate={(_type, cursor) => `?page=${cursor}`}
          pagination={
            delegatorsLoading
              ? null
              : {
                  next_page: hasNextPage ? String(page + 1) : null,
                  prev_page: hasPrevPage ? String(page - 1) : null,
                }
          }
          skeletonRows={PAGE_SIZE}
        />
      </Card>
    </div>
  );
};
