'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

import type { TxnFT, TxnMT, TxnReceipt } from 'nb-schemas';

import { fetchFtsMeta } from '@/actions/ft-meta';

import { BurrowEvents } from './burrow';
import { IntentsSwapEvents } from './intents';
import { RheaSwapEvents } from './rhea';
import { StakingEvents } from './staking';
import {
  buildMetaMap,
  collectFtContracts,
  flattenReceipts,
  isBurrowContract,
  isIntentsContract,
  isRheaSwapContract,
  isStakingPool,
} from './utils';

type Props = {
  fts: null | TxnFT[];
  mts: null | TxnMT[];
  receipts: TxnReceipt;
};

export const ContractEvents = ({ fts, mts, receipts }: Props) => {
  const flat = useMemo(() => flattenReceipts(receipts), [receipts]);
  const baseMeta = useMemo(() => buildMetaMap(fts, mts), [fts, mts]);

  const missing = useMemo(
    () => collectFtContracts(flat).filter((c) => !baseMeta.has(c)),
    [flat, baseMeta],
  );

  const { data: fetched } = useSWR(
    missing.length ? ['ft-meta', ...missing] : null,
    () => fetchFtsMeta(missing),
  );

  const meta = useMemo(() => {
    if (!fetched) return baseMeta;
    const merged = new Map(baseMeta);
    for (const [k, v] of Object.entries(fetched)) {
      if (!merged.has(k)) merged.set(k, v);
    }
    return merged;
  }, [baseMeta, fetched]);

  const elements: React.ReactNode[] = [];

  for (const receipt of flat) {
    const logs = receipt.outcome?.logs;
    if (!logs || logs.length === 0) continue;

    const receiver = receipt.receiver_account_id;

    if (isRheaSwapContract(receiver)) {
      elements.push(
        <RheaSwapEvents key={receipt.receipt_id} logs={logs} meta={meta} />,
      );
    } else if (isIntentsContract(receiver)) {
      elements.push(
        <IntentsSwapEvents key={receipt.receipt_id} logs={logs} meta={meta} />,
      );
    } else if (isBurrowContract(receiver)) {
      elements.push(
        <BurrowEvents key={receipt.receipt_id} logs={logs} meta={meta} />,
      );
    } else if (isStakingPool(receiver)) {
      elements.push(
        <StakingEvents
          contract={receiver}
          key={receipt.receipt_id}
          logs={logs}
        />,
      );
    }
  }

  const nonEmpty = elements.filter(Boolean);
  if (nonEmpty.length === 0) return null;

  return <div className="mt-1.5 space-y-1">{nonEmpty}</div>;
};
