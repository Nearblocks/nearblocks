/**
 * Component: TransactionsReceiptKind
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt Kind on Near Protocol.
 */

import { ReceiptKindInfo } from '@/includes/types';

const backgroundColorClasses: Record<string, string> = {
  transfer: 'bg-green-50',
  stake: 'bg-cyan-50',
  deployContract: 'bg-orange-50',
  addKey: 'bg-indigo-50',
  deleteKey: 'bg-red-50',
  functionCall: 'bg-blue-50',
  createAccount: 'bg-fuchsia-100',
  deleteAccount: 'bg-red-50',
  delegateAction: 'bg-blue-50',
};

export default function (props: ReceiptKindInfo) {
  const networkAccountId =
    context.networkId === 'mainnet' ? 'nearblocks.near' : 'nearblocks.testnet';

  const { getConfig, yoctoToNear } = VM.require(
    `${networkAccountId}/widget/includes.Utils.libs`,
  );

  const { network, t, action, onClick, isTxTypeActive } = props;

  const config = getConfig && getConfig(network);

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
        className={`p-2 mr-3 min-h-25 rounded-md inline-flex items-center justify-center text-base leading-5 cursor-pointer 
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
        <div className="inline-flex">
          <span className="text-xs">
            {action?.args?.deposit
              ? yoctoToNear(action?.args?.deposit, false)
              : action?.args?.deposit ?? ''}
            Ⓝ
          </span>
        </div>
      ) : null}
      {isTxTypeActive ? (
        action?.kind === 'functionCall' ? (
          <div className="py-2 ml-6">
            {prettyArgs && typeof prettyArgs === 'object' ? (
              <textarea
                readOnly
                rows={4}
                defaultValue={JSON.stringify(prettyArgs)}
                className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 p-3 my-3 resize-y"
              ></textarea>
            ) : (
              <div>
                <div className="bg-gray-100 rounded-md p-3 font-semibold my-3">
                  <div className="bg-inherit text-inherit font-inherit text-base border-none p-0">
                    <div className="max-h-52 overflow-auto">
                      <div className="p-4 h-full w-full">{prettyArgs}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : action?.kind === 'delegateAction' ? (
          <div className="py-2 ml-6">
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
                  src={`${config.ownerId}/widget/bos-components.components.Transactions.ReceiptKind`}
                  props={{
                    network: network,
                    t: t,
                    action: subaction,
                    isTxTypeActive: true,
                  }}
                />
              ))}
          </div>
        ) : null
      ) : null}
    </div>
  );
}
