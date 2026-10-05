import Link from 'next/link';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useMemo, useState } from 'react';

import Tooltip from '@/components/Atoms/Tooltip';
import CopyButton from '@/components/CopyButton';
import JsonView from '@/components/JsonView';
import { yoctoToNear, yoctoToTgas } from '@/libs/convertor';
import { formatNumber } from '@/libs/formatter';
import {
  gasLimit,
  isFailedStatus,
  prettify,
  refund,
  shortenString,
} from '@/libs/txn';
import type { NestedReceiptWithOutcome } from '@/types/near';

import Action from './Action';
import { StatusPill } from './Status';

type ActionsProps = {
  open: boolean;
  receipt: NestedReceiptWithOutcome;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type RowProps = {
  align?: 'center' | 'start';
  children: ReactNode;
  label: string;
};

const Row = ({ align = 'center', children, label }: RowProps) => (
  <div className={`flex ${align === 'start' ? 'items-start' : 'items-center'}`}>
    <h3 className="w-32 shrink-0 mb-2">{label}</h3>
    {children}
  </div>
);

type CopyRowProps = {
  children: ReactNode;
  copy: string;
  label: string;
  tooltip: string;
};

const CopyRow = ({ children, copy, label, tooltip }: CopyRowProps) => (
  <Row label={label}>
    <p className="flex items-center group mb-2">
      <Tooltip tooltip={tooltip}>{children}</Tooltip>
      <CopyButton
        buttonClassName="w-4 ml-1"
        className="hidden text-primary w-3.5 group-hover:block"
        text={copy}
      />
    </p>
  </Row>
);

const tabClass = (active: boolean) =>
  ` text-sm py-1 mr-4 ${
    active ? 'font-medium border-b-[3px] border-text-body' : 'text-text-label'
  }`;

const Actions = ({ open, receipt, setOpen }: ActionsProps) => {
  const [active, setActive] = useState('output');
  const failed = isFailedStatus(receipt.outcome.status);

  const result = useMemo(() => {
    const { logs: outcomeLogs, status } = receipt.outcome;
    let logs = 'No logs';
    let value = 'Empty result';

    if (outcomeLogs.length) {
      logs = outcomeLogs.join('\n');
    }

    if ('SuccessReceiptId' in status) {
      value = status.SuccessReceiptId;
    }

    if ('SuccessValue' in status && status.SuccessValue.length) {
      value = prettify(status.SuccessValue);
    }

    if ('Failure' in status) {
      value = JSON.stringify(status.Failure, undefined, 2);
    }

    return { logs, status: value };
  }, [receipt]);

  return (
    <>
      <div className="space-y-2">
        {receipt.actions.map((action, index) => (
          <Action
            action={action}
            failed={index === 0 && failed}
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
              className={tabClass(active === 'output')}
              onClick={() => setActive('output')}
            >
              Output
            </button>
            <button
              className={tabClass(active === 'inspect')}
              onClick={() => setActive('inspect')}
            >
              Inspect
            </button>
          </div>
          {active === 'output' && (
            <div className="pt-6">
              <h3 className="text-sm mb-1">Logs</h3>
              <JsonView className="mb-6">{result.logs}</JsonView>
              <h3 className="text-sm mb-1">Result</h3>
              <JsonView className="mb-6">{result.status}</JsonView>
            </div>
          )}
          {active === 'inspect' && (
            <div className="text-sm pt-6 pb-3">
              <Row label="Status">
                <span className="mb-2">
                  <StatusPill state={failed ? 'failed' : 'success'} />
                </span>
              </Row>
              {failed && receipt.outcome.error && (
                <Row align="start" label="Error">
                  <p className="mb-2 break-words">{receipt.outcome.error}</p>
                </Row>
              )}
              <CopyRow copy={receipt.id} label="Receipt" tooltip={receipt.id}>
                {shortenString(receipt.id)}
              </CopyRow>
              <CopyRow
                copy={receipt.outcome.block.hash}
                label="Block"
                tooltip={receipt.outcome.block.hash}
              >
                <Link
                  className="font-medium"
                  href={`/blocks/${receipt.outcome.block.hash}`}
                >
                  {shortenString(receipt.outcome.block.hash)}
                </Link>
              </CopyRow>
              <CopyRow
                copy={receipt.predecessorId}
                label="From"
                tooltip={receipt.predecessorId}
              >
                <Link
                  className="font-medium"
                  href={`/address/${receipt.predecessorId}`}
                >
                  {shortenString(receipt.predecessorId, 10, 10, 22)}
                </Link>
              </CopyRow>
              <CopyRow
                copy={receipt.receiverId}
                label="To"
                tooltip={receipt.receiverId}
              >
                <Link
                  className="font-medium"
                  href={`/address/${receipt.receiverId}`}
                >
                  {shortenString(receipt.receiverId, 10, 10, 22)}
                </Link>
              </CopyRow>
              <Row label="Gas Limit">
                <p className="mb-2">
                  {formatNumber(yoctoToTgas(gasLimit(receipt.actions)), 2)}
                </p>
              </Row>
              <Row label="Gas Burned">
                <p className="mb-2">
                  {formatNumber(
                    yoctoToTgas(String(receipt.outcome.gasBurnt)),
                    2,
                  )}{' '}
                  TGas
                </p>
              </Row>
              <Row label="Tokens Burned">
                <p className="mb-2">
                  {formatNumber(yoctoToNear(receipt.outcome.tokensBurnt), 6)} Ⓝ
                </p>
              </Row>
              <Row label="Refunded">
                <p className="mb-2">
                  {formatNumber(
                    yoctoToNear(refund(receipt.outcome.nestedReceipts)),
                    6,
                  )}{' '}
                  Ⓝ
                </p>
              </Row>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Actions;
