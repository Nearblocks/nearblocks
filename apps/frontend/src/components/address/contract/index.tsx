import { use } from 'react';
import { RiQuestionLine } from 'react-icons/ri';

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
  const account = !loading && accountPromise ? use(accountPromise) : null;
  const deployments =
    !loading && deploymentsPromise ? use(deploymentsPromise) : null;

  return (
    <List pairsPerRow={1}>
      <ListItem>
        <ListLeft className="flex min-w-40 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <RiQuestionLine className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              Checksum (SHA-256 in base58 encoding) of the contract binary
            </TooltipContent>
          </Tooltip>{' '}
          Contract Hash:
        </ListLeft>
        <ListRight className="xl:py-2.5">
          <p className="flex min-w-30 items-center gap-1">
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
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
      <ListItem>
        <ListLeft className="flex min-w-40 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <RiQuestionLine className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              Locked contract means that there are no access keys allowing the
              contract code to be re-deployed
            </TooltipContent>
          </Tooltip>
          Contract Locked:
        </ListLeft>
        <ListRight>
          <p>
            <SkeletonSlot
              fallback={<Skeleton className="w-20" />}
              loading={loading || !account}
            >
              {() => <>{account!.locked ? 'Yes' : 'No'}</>}
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
              The last time the contract was updated.
            </TooltipContent>
          </Tooltip>
          Last Updated:
        </ListLeft>
        <ListRight>
          <p>
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
            <TooltipContent>
              The transaction hash of the latest contract deployment.
            </TooltipContent>
          </Tooltip>
          Transaction Hash:
        </ListLeft>
        <ListRight>
          <p>
            <SkeletonSlot
              fallback={<Skeleton className="w-30" />}
              loading={loading || !deployments || deployments.length === 0}
            >
              {() => (
                <Link
                  className="text-link inline-block w-30 truncate align-middle"
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
              The account that deployed the contract.
            </TooltipContent>
          </Tooltip>
          Contract Creator:
        </ListLeft>
        <ListRight>
          <p>
            <SkeletonSlot
              fallback={<Skeleton className="w-20" />}
              loading={loading || !deployments || deployments.length === 0}
            >
              {() => (
                <AccountLink account={deployments![0].predecessor_account_id} />
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
                The transaction hash of the first contract deployment.
              </TooltipContent>
            </Tooltip>
            Transaction Hash:
          </ListLeft>
          <ListRight>
            <p>
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
