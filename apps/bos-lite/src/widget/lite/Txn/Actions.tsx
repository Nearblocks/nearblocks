import type { CopyProps } from '@/Atoms/Copy';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';

import type { ActionProps } from './Action';

export type ActionsProps = {
  actions: Action[];
  open: boolean;
  receipt: NestedReceiptWithOutcome;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

let TxnActionSkeleton = window?.TxnActionSkeleton || (() => <></>);
let JsonView = window?.JsonView || (({ children }) => <pre>{children}</pre>);

const prettify = (args: string) => {
  try {
    return JSON.stringify(JSON.parse(atob(args)), undefined, 2);
  } catch (error) {
    return args;
  }
};

const Actions = ({ actions, open, receipt, setOpen }: ActionsProps) => {
  let { yoctoToNear, yoctoToTgas } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { gasLimit, refund, shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (
    !yoctoToNear ||
    !yoctoToTgas ||
    !formatNumber ||
    !gasLimit ||
    !refund ||
    !shortenString
  )
    return <TxnActionSkeleton />;

  const [active, setActive] = useState('output');

  const result = useMemo(() => {
    let logs = 'No logs';
    let status = receipt.outcome.status.receiptId;

    if (receipt.outcome.logs.length) {
      logs = receipt.outcome.logs.join('\n');
    }

    if (receipt.outcome.status.type === 'successValue') {
      if (receipt.outcome.status.value.length === 0) {
        status = 'Empty result';
      } else {
        status = prettify(receipt.outcome.status.value) ?? '';
      }
    }

    if (receipt.outcome.status.type === 'failure') {
      status = prettify(receipt.outcome.status.error);
    }

    return { logs, status };
  }, [receipt]);

  return (
    <>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Widget<ActionProps>
            key={`action-${index}`}
            loading={<TxnActionSkeleton />}
            props={{ action, open, setOpen }}
            src={`${config_account}/widget/lite.Txn.Action`}
          />
        ))}
      </div>
      {open && (
        <div className="px-4 pt-6">
          <div>
            <button
              className={` text-sm py-1 mr-4 ${
                active === 'output'
                  ? 'font-medium border-b-[3px] border-text-body'
                  : 'text-text-label'
              }`}
              onClick={() => setActive('output')}
            >
              Output
            </button>
            <button
              className={` text-sm py-1 mr-4 ${
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
              <JsonView className="mb-6">{result.logs}</JsonView>
              <h3 className="text-sm mb-1">Result</h3>
              <JsonView className="mb-6">{result.status}</JsonView>
            </div>
          )}
          {active === 'inspect' && (
            <div className="text-sm pt-6 pb-3">
              <div className="flex items-center">
                <h3 className="w-32 mb-2">Receipt</h3>
                <p className="flex items-center group mb-2">
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: shortenString(receipt.id),
                      tooltip: receipt.id,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'w-4 ml-1',
                      className: 'hidden text-primary w-3.5 group-hover:block',
                      text: receipt.id,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </p>
              </div>
              <div className="flex items-center">
                <h3 className="w-32 mb-2">Block</h3>
                <p className="flex items-center group mb-2">
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: (
                        <Link
                          className="font-medium"
                          href={`/blocks/${receipt.outcome.block.hash}`}
                        >
                          {shortenString(receipt.outcome.block.hash)}
                        </Link>
                      ),
                      tooltip: receipt.outcome.block.hash,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'w-4 ml-1',
                      className: 'hidden text-primary w-3.5 group-hover:block',
                      text: receipt.outcome.block.hash,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </p>
              </div>
              <div className="flex items-center">
                <h3 className="w-32 mb-2">From</h3>
                <p className="flex items-center group mb-2">
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: (
                        <Link
                          className="font-medium"
                          href={`/address/${receipt.predecessorId}`}
                        >
                          {shortenString(receipt.predecessorId, 10, 10, 22)}
                        </Link>
                      ),
                      tooltip: receipt.predecessorId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'w-4 ml-1',
                      className: 'hidden text-primary w-3.5 group-hover:block',
                      text: receipt.predecessorId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </p>
              </div>
              <div className="flex items-center">
                <h3 className="w-32 mb-2">To</h3>
                <p className="flex items-center group mb-2">
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: (
                        <Link
                          className="font-medium"
                          href={`/address/${receipt.receiverId}`}
                        >
                          {shortenString(receipt.receiverId, 10, 10, 22)}
                        </Link>
                      ),
                      tooltip: receipt.receiverId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'w-4 ml-1',
                      className: 'hidden text-primary w-3.5 group-hover:block',
                      text: receipt.receiverId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </p>
              </div>
              <div className="flex items-center">
                <h3 className="w-32 mb-2">Gas Limit</h3>
                <p className="mb-2">
                  {formatNumber(yoctoToTgas(gasLimit(receipt.actions)), 2)}
                </p>
              </div>
              <div className="flex items-center">
                <h3 className="w-32 mb-2">Gas Burned</h3>
                <p className="mb-2">
                  {formatNumber(
                    yoctoToTgas(String(receipt.outcome.gasBurnt)),
                    2,
                  )}{' '}
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

export default Actions;
