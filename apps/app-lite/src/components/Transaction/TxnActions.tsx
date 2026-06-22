import Link from 'next/link';
import { useMemo, useState } from 'react';

import Copy from '@/components/Common/Copy';
import Tooltip from '@/components/Common/Tooltip';
import TxnAction from '@/components/Transaction/TxnAction';
import convertor from '@/libs/convertor';
import formatter from '@/libs/formatter';
import { gasLimit, prettify, refund, shortenString } from '@/libs/utils';

interface TxnActionsProps {
  actions: any[];
  open: boolean;
  receipt: any;
  setOpen: (open: boolean) => void;
}

const TxnActions = ({ actions, open, receipt, setOpen }: TxnActionsProps) => {
  const { gasToTgas, yoctoToNear } = convertor();
  const { formatNumber } = formatter();
  const [active, setActive] = useState<'inspect' | 'output'>('output');

  const result = useMemo(() => {
    let logs = 'No logs';
    let status = 'Empty result';
    if (receipt.outcome.logs.length) {
      logs = receipt.outcome.logs.join('\n');
    }
    if (receipt.outcome.status.type === 'successReceiptId') {
      status = receipt.outcome.status.receiptId;
    }
    if (
      receipt.outcome.status.type === 'successValue' &&
      receipt.outcome.status.value.length
    ) {
      status = prettify(receipt.outcome.status.value);
    }
    if (receipt.outcome.status.type === 'failure') {
      status = JSON.stringify(receipt.outcome.status.error, undefined, 2);
    }
    return { logs, status };
  }, [receipt]);

  return (
    <>
      <div className="space-y-2">
        {actions?.map((action, index) => (
          <TxnAction
            action={action}
            key={`action-${index}`}
            open={open}
            receiver={receipt.receiverId}
            setOpen={setOpen}
          />
        ))}
      </div>

      {open && (
        <div className="px-4 pt-6">
          <div>
            <button
              className={`text-sm py-1 mr-4 ${
                active === 'output'
                  ? 'font-medium border-b-[3px] border-text-body'
                  : 'text-text-label'
              }`}
              onClick={() => setActive('output')}
            >
              Output
            </button>
            <button
              className={`text-sm py-1 mr-4 ${
                active === 'inspect'
                  ? 'font-medium border-b-[3px] border-text-body'
                  : 'text-text-label'
              }`}
              onClick={() => setActive('inspect')}
            >
              Inspect
            </button>
          </div>

          {active === 'output' && (
            <div className="pt-6">
              <h3 className="text-sm mb-1">Logs</h3>
              <pre className="mb-6 bg-bg-code p-3 rounded text-sm overflow-x-auto">
                {result.logs}
              </pre>

              <h3 className="text-sm mb-1">Result</h3>
              <pre className="mb-6 bg-bg-code p-3 rounded text-sm overflow-x-auto">
                {result.status}
              </pre>
            </div>
          )}

          {active === 'inspect' && (
            <div className="text-sm pt-6 pb-3">
              <div className="flex items-center">
                <h3 className="w-32 mb-2">Receipt</h3>
                <p className="flex items-center group mb-2">
                  <Tooltip tooltip={receipt.id}>
                    {shortenString(receipt.id)}
                  </Tooltip>
                  <Copy
                    buttonClassName="w-4 ml-1"
                    className="hidden text-primary w-3.5 group-hover:block"
                    text={receipt.id}
                  />
                </p>
              </div>

              <div className="flex items-center">
                <h3 className="w-32 mb-2">Block</h3>
                <p className="flex items-center group mb-2">
                  <Tooltip tooltip={receipt?.outcome?.block?.hash}>
                    <Link
                      className="font-medium"
                      href={`/blocks/${receipt?.outcome?.block?.hash}`}
                    >
                      {shortenString(receipt?.outcome?.block?.hash)}
                    </Link>
                  </Tooltip>
                  <Copy
                    buttonClassName="w-4 ml-1"
                    className="hidden text-primary w-3.5 group-hover:block"
                    text={receipt.outcome.block.hash}
                  />
                </p>
              </div>

              <div className="flex items-center">
                <h3 className="w-32 mb-2">From</h3>
                <p className="flex items-center group mb-2">
                  <Tooltip tooltip={receipt.predecessorId}>
                    <Link
                      className="font-medium"
                      href={`/address/${receipt.predecessorId}`}
                    >
                      {shortenString(receipt.predecessorId, 10, 10, 22)}
                    </Link>
                  </Tooltip>
                  <Copy
                    buttonClassName="w-4 ml-1"
                    className="hidden text-primary w-3.5 group-hover:block"
                    text={receipt.predecessorId}
                  />
                </p>
              </div>

              <div className="flex items-center">
                <h3 className="w-32 mb-2">To</h3>
                <p className="flex items-center group mb-2">
                  <Tooltip tooltip={receipt.receiverId}>
                    <Link
                      className="font-medium"
                      href={`/address/${receipt.receiverId}`}
                    >
                      {shortenString(receipt.receiverId, 10, 10, 22)}
                    </Link>
                  </Tooltip>
                  <Copy
                    buttonClassName="w-4 ml-1"
                    className="hidden text-primary w-3.5 group-hover:block"
                    text={receipt.receiverId}
                  />
                </p>
              </div>

              <div className="flex items-center">
                <h3 className="w-32 mb-2">Gas Limit</h3>
                <p className="mb-2">
                  {formatNumber(gasToTgas(gasLimit(receipt.actions)), 2)}
                </p>
              </div>

              <div className="flex items-center">
                <h3 className="w-32 mb-2">Gas Burned</h3>
                <p className="mb-2">
                  {formatNumber(gasToTgas(String(receipt.outcome.gasBurnt)), 2)}{' '}
                  TGas
                </p>
              </div>

              <div className="flex items-center">
                <h3 className="w-32 mb-2">Tokens Burned</h3>
                <p className="mb-2">
                  {formatNumber(yoctoToNear(receipt.outcome.tokensBurnt), 6)} Ⓝ
                </p>
              </div>

              <div className="flex items-center">
                <h3 className="w-32 mb-2">Refunded</h3>
                <p className="mb-2">
                  {formatNumber(
                    yoctoToNear(refund(receipt.outcome.nestedReceipts)),
                    6,
                  )}{' '}
                  Ⓝ
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TxnActions;
