import { useEffect, useState } from 'react';

import { RPC } from 'nb-near';

import ErrorDisplay from '@/components/Common/Error';
import { TxnExecutionSkeleton } from '@/components/Skeletons/Txn';
import TxnExecution from '@/components/Transaction/TxnExecution';
import execution from '@/libs/execution';
import { getExperimentalTxnStatus } from '@/libs/rpc';

interface TxnTabsProps {
  hash: string;
  rpcUrl: string;
}

const tabs = [0];

const TxnTabs = ({ hash, rpcUrl }: TxnTabsProps) => {
  const [active, setActive] = useState(tabs[0]);
  const [data, setData] = useState<Record<number, any>>({});
  const [error, setError] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [expand, setExpand] = useState(false);
  const { nestReceipts, parseOutcome, parseReceipt } = execution();
  useEffect(() => {
    if (!rpcUrl || !hash || active !== 0) return;

    let cancelled = false;

    const fetchExecutionPlan = async () => {
      setLoading((prev) => ({ ...prev, [active]: true }));

      try {
        const rpcEndpoint = new RPC(rpcUrl);
        const response = await getExperimentalTxnStatus(rpcEndpoint, hash);

        if (cancelled) return;

        if (response?.result) {
          const result = response?.result;

          const blocksMap = result?.receipts_outcome?.reduce(
            (map, row) =>
              map.set(row?.block_hash, {
                hash: row?.block_hash,
                height: 0,
                timestamp: 0,
              }),
            new Map(),
          );

          const receiptsMap = result?.receipts_outcome?.reduce(
            (mapping, receiptOutcome) => {
              const receipt = parseReceipt(
                result.receipts.find(
                  (rpcReceipt) => rpcReceipt?.receipt_id === receiptOutcome?.id,
                ),
                receiptOutcome,
                result?.transaction,
              );
              return mapping?.set(receiptOutcome?.id, {
                ...receipt,
                outcome: parseOutcome(receiptOutcome, blocksMap),
              });
            },
            new Map(),
          );

          setData((state) => ({
            ...state,
            [active]: nestReceipts(
              result?.transaction_outcome?.outcome?.receipt_ids?.[0],
              receiptsMap,
            ),
          }));
          setError((state) => ({ ...state, [active]: null }));
        } else {
          setError((state) => ({
            ...state,
            [active]: new Error('Failed to fetch execution plan'),
          }));
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching execution plan:', err);
        setError((state) => ({ ...state, [active]: err }));
      } finally {
        if (!cancelled) {
          setLoading((state) => ({ ...state, [active]: false }));
        }
      }
    };

    fetchExecutionPlan();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, active, rpcUrl]);

  return (
    <div className="bg-bg-box lg:rounded-xl shadow px-6 mt-8">
      <div className="flex justify-between">
        <div className="pt-4 pb-6">
          {tabs.map((tab) => (
            <button
              className={`py-1 mr-4 ${
                active === tab
                  ? 'font-medium border-b-[3px] border-text-body'
                  : 'text-text-label'
              }`}
              key={tab}
              onClick={() => setActive(tab)}
            >
              {tab === 0 && 'Execution Plan'}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-label">&nbsp;</span>
          <button onClick={() => setExpand((e) => !e)}>
            {expand ? 'Collapse All -' : 'Expand All +'}
          </button>
        </div>
      </div>
      <div className="lg:px-4 pb-6">
        {error[active] ? (
          <ErrorDisplay title="Error Fetching Txn Details" />
        ) : loading[active] ? (
          <>{active === 0 && <TxnExecutionSkeleton />}</>
        ) : (
          <>
            {active === 0 && (
              <TxnExecution expand={expand} receipt={data[active]} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TxnTabs;
