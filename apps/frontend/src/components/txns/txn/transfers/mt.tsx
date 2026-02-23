'use client';

import { useMemo, useState } from 'react';

import { TxnMT } from 'nb-schemas';

import { AccountLink, Link } from '@/components/link';
import {
  NFTMedia,
  TokenAmount,
  TokenImage,
  TokenLink,
} from '@/components/token';
import { ScrollArea } from '@/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';

import { TransferSummary } from './transfer';

type Props = {
  mts: TxnMT[];
};

type NetTransfer = {
  affected_account_id: string;
  contract_account_id: string;
  delta: bigint;
  meta: TxnMT['base_meta'];
  token_id: string;
};

export const MTTransfers = ({ mts }: Props) => {
  const [tab, setTab] = useState<'all' | 'net'>('all');

  const ftLike = useMemo(
    () =>
      mts.filter(
        (mt) =>
          mt.base_meta?.decimals != null &&
          (BigInt(mt.delta_amount) > 0n || mt.involved_account_id === null),
      ),
    [mts],
  );

  const nftLike = useMemo(
    () =>
      mts.filter(
        (mt) =>
          mt.base_meta?.decimals == null &&
          (BigInt(mt.delta_amount) > 0n || mt.involved_account_id === null),
      ),
    [mts],
  );

  const hasFts = ftLike.length > 0;

  const netMts = useMemo(() => {
    const map = new Map<string, NetTransfer>();
    for (const mt of mts) {
      if (mt.base_meta?.decimals == null) continue;
      const key = `${mt.affected_account_id}:${mt.contract_account_id}:${mt.token_id}`;
      const prev = map.get(key);
      if (prev) {
        prev.delta += BigInt(mt.delta_amount);
      } else {
        map.set(key, {
          affected_account_id: mt.affected_account_id,
          contract_account_id: mt.contract_account_id,
          delta: BigInt(mt.delta_amount),
          meta: mt.base_meta,
          token_id: mt.token_id,
        });
      }
    }
    return Array.from(map.values());
  }, [mts]);

  return (
    <>
      {hasFts && (
        <Tabs
          className="gap-0"
          onValueChange={(v) => setTab(v as 'all' | 'net')}
          value={tab}
        >
          <TabsList className="bg-card">
            <TabsTrigger value="all">All Transfers</TabsTrigger>
            <TabsTrigger value="net">Net Transfers</TabsTrigger>
          </TabsList>
          <ScrollArea className="max-h-53">
            <TabsContent className="flex flex-col gap-3 pt-3" value="all">
              {ftLike.map((mt, i) => (
                <div className="flex flex-wrap items-center gap-1" key={i}>
                  <TransferSummary
                    affected={mt.affected_account_id}
                    cause={mt.cause}
                    involved={mt.involved_account_id}
                  >
                    <TokenAmount
                      amount={mt.delta_amount}
                      decimals={mt.base_meta?.decimals ?? 0}
                      hideSign
                    />
                    <TokenImage
                      alt={mt.base_meta?.name ?? ''}
                      className="m-px size-5 rounded-full border"
                      src={mt.base_meta?.icon ?? ''}
                    />
                    <TokenLink
                      contract={mt.contract_account_id}
                      name={mt.base_meta?.name}
                      symbol={mt.base_meta?.symbol}
                      type="mt-tokens"
                    />
                  </TransferSummary>
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
          <ScrollArea className="max-h-53">
            <TabsContent className="flex flex-col gap-3 pt-3" value="net">
              {netMts.map((net, i) => (
                <div className="flex flex-wrap items-center gap-1" key={i}>
                  <AccountLink
                    account={net.affected_account_id}
                    textClassName="max-w-40"
                  />
                  <span>{net.delta >= 0n ? 'received' : 'sent'}</span>
                  <TokenAmount
                    amount={net.delta.toString()}
                    decimals={net.meta?.decimals ?? 0}
                    hideSign
                  />
                  <TokenImage
                    alt={net.meta?.name ?? ''}
                    className="m-px size-5 rounded-full border"
                    src={net.meta?.icon ?? ''}
                  />
                  <TokenLink
                    contract={net.contract_account_id}
                    name={net.meta?.name}
                    symbol={net.meta?.symbol}
                    type="mt-tokens"
                  />
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )}
      {nftLike.length > 0 && (
        <ScrollArea className={hasFts ? 'mt-3 max-h-44' : 'max-h-44'}>
          <div className="flex flex-col gap-3">
            {nftLike.map((mt, i) => (
              <div className="flex items-center gap-2" key={i}>
                <Link
                  className="text-link size-11"
                  href={`/mt-token/${mt.contract_account_id}/${mt.token_id}`}
                >
                  <NFTMedia
                    alt={mt.token_meta?.title ?? mt.token_id}
                    base={mt.base_meta?.base_uri}
                    className="m-px size-11 rounded-lg border"
                    media={mt.token_meta?.media}
                    reference={mt.token_meta?.reference}
                  />
                </Link>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Token</span>
                    <Link
                      className="text-link"
                      href={`/mt-token/${mt.contract_account_id}/${mt.token_id}`}
                    >
                      {mt.token_id}
                    </Link>
                    <TokenImage
                      alt={mt.token_meta?.title ?? mt.base_meta?.name ?? ''}
                      className="m-px size-5 rounded-full border"
                      src={mt.token_meta?.media ?? mt.base_meta?.icon ?? ''}
                    />
                    <TokenLink
                      contract={mt.contract_account_id}
                      name={mt.base_meta?.name}
                      symbol={mt.base_meta?.symbol}
                      type="mt-tokens"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <TransferSummary
                      affected={mt.affected_account_id}
                      cause={mt.cause}
                      involved={mt.involved_account_id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );
};
