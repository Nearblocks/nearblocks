import { useMemo, useState } from 'react';

import Skeleton from '@/components/Skeleton';
import { nestReceipts, parseOutcome, parseReceipt } from '@/libs/execution';
import type {
  FinalExecutionOutcomeWithReceiptView,
  NestedReceiptWithOutcome,
  ParsedBlock,
  ParsedReceipt,
} from '@/types/near';

import Receipt from './Receipt';

type TabsProps = {
  data: FinalExecutionOutcomeWithReceiptView | null;
};

const Tabs = ({ data }: TabsProps) => {
  const [expand, setExpand] = useState(false);

  const receipt = useMemo(() => {
    if (!data) return null;

    const blocksMap = data.receipts_outcome.reduce(
      (map, row) =>
        map.set(row.block_hash, {
          hash: row.block_hash,
          height: 0,
          timestamp: 0,
        }),
      new Map<string, ParsedBlock>(),
    );
    const receiptsMap = data.receipts_outcome.reduce(
      (mapping, receiptOutcome) => {
        const parsed = parseReceipt(
          data.receipts.find(
            (rpcReceipt) => rpcReceipt.receipt_id === receiptOutcome.id,
          ),
          receiptOutcome,
          data.transaction,
        );

        return mapping.set(receiptOutcome.id, {
          ...parsed,
          outcome: parseOutcome(receiptOutcome, blocksMap),
        });
      },
      new Map<string, ParsedReceipt>(),
    );

    return nestReceipts(
      data.transaction_outcome.outcome.receipt_ids[0],
      receiptsMap,
    ) as NestedReceiptWithOutcome;
  }, [data]);

  return (
    <div className="bg-bg-box lg:rounded-xl shadow px-6 mt-8">
      <div className="flex justify-between">
        <div className="pt-4 pb-6">
          <button className="py-1 mr-4 font-medium border-b-[3px] border-text-body">
            Execution Plan
          </button>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-label">&nbsp;</span>
          <button onClick={() => setExpand((e) => !e)}>
            {expand ? 'Collapse All -' : 'Expand All +'}
          </button>
        </div>
      </div>
      <div className="lg:px-4 pb-6">
        {receipt ? (
          <Receipt
            convertion
            expand={expand}
            outgoingReceipts={[]}
            receipt={receipt}
          />
        ) : (
          <div>
            <div className="flex justify-between items-center text-sm mb-6">
              <Skeleton className="block h-5 w-40" loading>
                <span className="text-text-label">&nbsp;</span>
              </Skeleton>
            </div>
            <Receipt
              convertion
              expand={false}
              outgoingReceipts={[]}
              receipt={{ id: '' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
