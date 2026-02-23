'use client';

import { useMemo, useState } from 'react';

import { TxnFT } from 'nb-schemas';

import { AccountLink } from '@/components/link';
import { TokenAmount, TokenImage, TokenLink } from '@/components/token';
import { ScrollArea } from '@/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';

import { TransferSummary } from './transfer';

type Props = {
  fts: TxnFT[];
};

type NetTransfer = {
  affected_account_id: string;
  contract_account_id: string;
  delta: bigint;
  meta: TxnFT['meta'];
};

export const FTTransfers = ({ fts }: Props) => {
  const [tab, setTab] = useState<'all' | 'net'>('all');

  const transfers = useMemo(
    () =>
      fts.filter(
        (ft) => BigInt(ft.delta_amount) > 0n || ft.involved_account_id === null,
      ),
    [fts],
  );

  const netFts = useMemo(() => {
    const map = new Map<string, NetTransfer>();
    for (const ft of fts) {
      const key = `${ft.affected_account_id}:${ft.contract_account_id}`;
      const prev = map.get(key);

      if (prev) {
        prev.delta += BigInt(ft.delta_amount);
      } else {
        map.set(key, {
          affected_account_id: ft.affected_account_id,
          contract_account_id: ft.contract_account_id,
          delta: BigInt(ft.delta_amount),
          meta: ft.meta,
        });
      }
    }
    return Array.from(map.values());
  }, [fts]);

  return (
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
          {transfers.map((ft, i) => (
            <div className="flex flex-wrap items-center gap-1" key={i}>
              <TransferSummary
                affected={ft.affected_account_id}
                cause={ft.cause}
                involved={ft.involved_account_id}
              >
                <TokenAmount
                  amount={ft.delta_amount}
                  decimals={ft.meta?.decimals ?? 0}
                  hideSign
                />
                <TokenImage
                  alt={ft.meta?.name ?? ''}
                  className="m-px size-5 rounded-full border"
                  src={ft.meta?.icon ?? ''}
                />
                <TokenLink
                  contract={ft.contract_account_id}
                  name={ft.meta?.name}
                  symbol={ft.meta?.symbol}
                />
              </TransferSummary>
            </div>
          ))}
        </TabsContent>
      </ScrollArea>
      <ScrollArea className="max-h-53">
        <TabsContent className="flex flex-col gap-3 pt-3" value="net">
          {netFts.map((net, i) => (
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
              />
            </div>
          ))}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};
