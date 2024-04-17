/**
 * Component: TransactionsReceiptKind
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt Kind on Near Protocol.
 */

import { ReceiptKindInfo } from '@/includes/types';

const backgroundColorClasses: Record<string, string> = {
  transfer: 'bg-green-50 dark:bg-green-200',
  stake: 'bg-cyan-50 dark:bg-cyan-900',
  deployContract: 'bg-orange-50 dark:bg-orange-900',
  addKey: 'bg-indigo-50 dark:bg-indigo-900',
  deleteKey: 'bg-red-50 dark:bg-red-900',
  functionCall: 'bg-blue-50 dark:bg-black-200',
  createAccount: 'bg-fuchsia-100 dark:bg-fuchsia-900',
  deleteAccount: 'bg-red-50 dark:bg-red-900',
  delegateAction: 'bg-blue-50 dark:bg-black-200',
};

export default function (props: ReceiptKindInfo) {
  const { network, t, action, onClick, isTxTypeActive, ownerId } = props;

  const { yoctoToNear } = VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const args = action.args.args;
  const decodedArgs = args ? Buffer.from(args, 'base64') : null;

  let prettyArgs: object | string;
  try {
    if (decodedArgs) {
      const parsedJSONArgs = JSON.parse(decodedArgs.toString());
      prettyArgs =
        typeof parsedJSONArgs === 'boolean'
          ? JSON.stringify(parsedJSONArgs)
          : parsedJSONArgs;
    } else {
      prettyArgs = '';
    }
  } catch {
    prettyArgs = Array.from(decodedArgs || [])
      .map((byte: any) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  return (
    <div className="py-2.5">
      <div
        className={`p-2 mr-3 min-h-25 rounded-md inline-flex items-center justify-center leading-5 cursor-pointer 
        transition-all ease-in-out 
        ${backgroundColorClasses[action.kind] || ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {action?.kind !== 'functionCall' &&
          action?.kind !== 'delegateAction' &&
          t(`txns:${action?.kind}`)}
        {action?.kind === 'delegateAction' ? (
          <div className="inline-flex text-sm">{`Delegate action`}</div>
        ) : null}
        {action?.kind === 'functionCall' ? (
          <div className="inline-flex text-sm">{`'${action?.args?.methodName}'`}</div>
        ) : null}
        {onClick ? (
          <div className="ml-2">{isTxTypeActive ? '-' : '+'}</div>
        ) : null}
      </div>
      {action?.kind === 'transfer' ? (
        <div className="inline-flex justify-center">
          <span className="text-xs whitespace-nowrap">
            {action?.args?.deposit
              ? yoctoToNear(action?.args?.deposit, false)
              : action?.args?.deposit ?? ''}
            Ⓝ
          </span>
        </div>
      ) : null}
      {isTxTypeActive ? (
        action?.kind === 'functionCall' ? (
          <div className="py-2">
            {prettyArgs && typeof prettyArgs === 'object' ? (
              <textarea
                readOnly
                defaultValue={JSON.stringify(prettyArgs)}
                className="block appearance-none outline-none w-full max-md:w-fit border dark:border-black-200 dark:bg-black-200 rounded-lg bg-gray-100 p-5 my-3 resize-y"
              ></textarea>
            ) : (
              <div>
                <div className="bg-gray-100 dark:bg-black-200 rounded-md p-3 font-medium my-3">
                  <div className="bg-inherit text-inherit font-inherit border-none p-0">
                    <div className="max-h-52 overflow-auto">
                      <div className="p-4 h-full w-full">{prettyArgs}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : action?.kind === 'delegateAction' ? (
          <div className="py-2">
            <span className="font-semibold">
              {action?.args?.senderId
                ? `Actions delegated for ${action?.args?.senderId}:`
                : ''}
            </span>
            {[...action.args.actions]
              .sort(
                (actionA, actionB) =>
                  actionA.delegateIndex - actionB.delegateIndex,
              )
              .map((subaction) => (
                <Widget
                  key={subaction.delegateIndex}
                  src={`${ownerId}/widget/bos-components.components.Transactions.ReceiptKind`}
                  props={{
                    network: network,
                    t: t,
                    action: subaction,
                    isTxTypeActive: true,
                    ownerId,
                  }}
                />
              ))}
          </div>
        ) : null
      ) : null}
    </div>
  );
}
