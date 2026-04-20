'use client';

import { RiQuestionLine } from '@remixicon/react';
import { use } from 'react';

import {
  Account,
  ContractDeployment,
  Contract as ContractType,
} from 'nb-schemas';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { ListItem, ListLeft, ListRight } from '@/components/list';
import { List } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { LongDate } from '@/components/timestamp';
import { useLocale } from '@/hooks/use-locale';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  accountPromise?: Promise<Account | null>;
  contract?: ContractType | null;
  deploymentsPromise?: Promise<ContractDeployment[] | null>;
  loading?: boolean;
};

export const Contract = ({
  accountPromise,
  contract,
  deploymentsPromise,
  loading,
}: Props) => {
  const { t } = useLocale('address');
  const account = !loading && accountPromise ? use(accountPromise) : null;
  const deployments =
    !loading && deploymentsPromise ? use(deploymentsPromise) : null;

  return (
    <List pairsPerRow={1}>
      <ListItem>
        <ListLeft className="flex min-w-50 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <RiQuestionLine className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t('contract.overview.contractHashTip')}
            </TooltipContent>
          </Tooltip>{' '}
          {t('contract.overview.contractHash')}
        </ListLeft>
        <ListRight className="xl:py-2.5">
          <p className="flex items-center gap-1">
            <SkeletonSlot
              fallback={<Skeleton className="h-7 w-70" />}
              loading={loading || !contract}
            >
              {() => (
                <>
                  {contract!.code_hash}{' '}
                  <Copy
                    className="text-muted-foreground"
                    size="icon-xs"
                    text={contract!.code_hash || ''}
                  />
                </>
              )}
            </SkeletonSlot>
          </p>
        </ListRight>
      </ListItem>
      {contract?.global_account_id && (
        <ListItem>
          <ListLeft className="flex min-w-40 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t('contract.overview.globalContractAccountTip')}
              </TooltipContent>
            </Tooltip>
            {t('contract.overview.globalContractAccount')}
          </ListLeft>
          <ListRight>
            <p>
              <AccountLink
                account={contract.global_account_id}
                textClassName="max-w-60"
              />
            </p>
          </ListRight>
        </ListItem>
      )}
      {contract?.global_code_hash && (
        <ListItem>
          <ListLeft className="flex min-w-40 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t('contract.overview.globalContractHashTip')}
              </TooltipContent>
            </Tooltip>
            {t('contract.overview.globalContractHash')}
          </ListLeft>
          <ListRight className="xl:py-2.5">
            <p className="flex min-w-30 items-center gap-1">
              {contract.global_code_hash}{' '}
              <Copy
                className="text-muted-foreground"
                size="icon-xs"
                text={contract.global_code_hash}
              />
            </p>
          </ListRight>
        </ListItem>
      )}
      <ListItem>
        <ListLeft className="flex min-w-40 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <RiQuestionLine className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t('contract.overview.contractLockedTip')}
            </TooltipContent>
          </Tooltip>
          {t('contract.overview.contractLocked')}
        </ListLeft>
        <ListRight>
          <p className="py-0.5">
            <SkeletonSlot
              fallback={<Skeleton className="w-20" />}
              loading={loading || !account}
            >
              {() => (
                <>
                  {account!.locked
                    ? t('contract.overview.yes')
                    : t('contract.overview.no')}
                </>
              )}
            </SkeletonSlot>
          </p>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft className="flex min-w-40 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <RiQuestionLine className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t('contract.overview.lastUpdatedTip')}
            </TooltipContent>
          </Tooltip>
          {t('contract.overview.lastUpdated')}
        </ListLeft>
        <ListRight>
          <p className="py-0.5">
            <SkeletonSlot
              fallback={<Skeleton className="w-60" />}
              loading={loading || !deployments || deployments.length === 0}
            >
              {() => (
                <LongDate
                  ns={
                    deployments?.[1]?.block?.block_timestamp ??
                    deployments![0].block.block_timestamp
                  }
                />
              )}
            </SkeletonSlot>
          </p>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft className="flex min-w-40 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <RiQuestionLine className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{t('contract.overview.txnHashTip')}</TooltipContent>
          </Tooltip>
          {t('contract.overview.txnHash')}
        </ListLeft>
        <ListRight>
          <p className="py-0.5">
            <SkeletonSlot
              fallback={<Skeleton className="w-50" />}
              loading={loading || !deployments || deployments.length === 0}
            >
              {() => (
                <Link
                  className="text-link inline-block w-50 truncate align-middle"
                  href={`/txns/${
                    deployments?.[1]?.transaction_hash ??
                    deployments![0].transaction_hash
                  }`}
                >
                  {deployments?.[1]?.transaction_hash ??
                    deployments![0].transaction_hash}
                </Link>
              )}
            </SkeletonSlot>
          </p>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft className="flex min-w-40 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <RiQuestionLine className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t('contract.overview.contractCreatorTip')}
            </TooltipContent>
          </Tooltip>
          {t('contract.overview.contractCreator')}
        </ListLeft>
        <ListRight>
          <p>
            <SkeletonSlot
              fallback={<Skeleton className="w-30" />}
              loading={loading || !deployments || deployments.length === 0}
            >
              {() => (
                <AccountLink
                  account={deployments![0].predecessor_account_id}
                  textClassName="max-w-60"
                />
              )}
            </SkeletonSlot>
          </p>
        </ListRight>
      </ListItem>
      {deployments && deployments.length > 1 && (
        <ListItem>
          <ListLeft className="flex min-w-40 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t('contract.overview.txnHashFirstTip')}
              </TooltipContent>
            </Tooltip>
            {t('contract.overview.txnHash')}
          </ListLeft>
          <ListRight>
            <p className="py-0.5">
              <SkeletonSlot
                fallback={<Skeleton className="w-30" />}
                loading={loading || !deployments || deployments.length === 0}
              >
                {() => (
                  <Link
                    className="text-link inline-block w-30 truncate align-middle"
                    href={`/txns/${deployments![0].transaction_hash}`}
                  >
                    {deployments![0].transaction_hash}
                  </Link>
                )}
              </SkeletonSlot>
            </p>
          </ListRight>
        </ListItem>
      )}
    </List>
  );
};
