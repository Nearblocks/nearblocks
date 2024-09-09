import { hexy } from '@/utils/hexy';
import { yoctoToNear } from '@/utils/libs';
import { ReceiptKindInfo } from '@/utils/types';
import RlpTransaction from './RlpTransaction';
import useTranslation from 'next-translate/useTranslation';
import FaTimesCircle from '@/components/Icons/FaTimesCircle';

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

const ReceiptKind = (props: ReceiptKindInfo) => {
  const { action, onClick, isTxTypeActive, receiver, receipt } = props;
  const { t } = useTranslation();
  const args = action?.args?.args;
  const modifiedData =
    action?.args?.methodName === 'submit' && receiver.includes('aurora')
      ? { tx_bytes_b64: action?.args.args_base64 || action?.args.args }
      : action?.args.args_base64 || action?.args.args;

  function displayArgs(args: any) {
    if (!args || typeof args === 'undefined') return 'The arguments are empty';

    let pretty = '';
    const decoded = Buffer.from(args, 'base64');
    try {
      const parsed = JSON.parse(decoded.toString());
      if (parsed) {
        pretty = JSON.stringify(parsed, null, 2);
      } else {
        pretty = hexy(decoded, { format: 'twos' });
      }
    } catch {
      pretty = hexy(decoded, { format: 'twos' });
    }

    return pretty;
  }

  const status = receipt?.outcome?.status;
  const isSuccess =
    status &&
    (status.type === 'successValue' || status.type === 'successReceiptId');

  return (
    <div className="pb-3">
      <div
        className={`relative p-2 mr-3 min-h-25 rounded-md inline-flex items-center justify-center leading-5 cursor-pointer 
        transition-all ease-in-out 
        ${
          !isSuccess
            ? 'bg-red-50 dark:bg-black-200'
            : backgroundColorClasses[action.kind] || ''
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {action?.kind !== 'functionCall' &&
          action?.kind !== 'delegateAction' &&
          t(`txns:${action?.kind}`)}
        {action?.kind === 'delegateAction' ? (
          <div className="inline-flex text-sm">{`Delegate`}</div>
        ) : null}
        {action?.kind === 'functionCall' ? (
          <div className="inline-flex text-sm">{`'${action?.args?.methodName}'`}</div>
        ) : null}
        {onClick ? (
          <div className="ml-2">{isTxTypeActive ? '-' : '+'}</div>
        ) : null}
        {!isSuccess && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1">
            <FaTimesCircle />
          </div>
        )}
      </div>
      {action?.kind === 'transfer' ? (
        <div className="inline-flex justify-center">
          <span className="text-xs whitespace-nowrap">
            {action?.args?.deposit
              ? action?.args?.deposit &&
                yoctoToNear(action?.args?.deposit, false)
              : action?.args?.deposit ?? ''}
            Ⓝ
          </span>
        </div>
      ) : null}
      {isTxTypeActive ? (
        action?.kind === 'functionCall' ? (
          action?.args?.methodName === 'rlp_execute' ||
          (action?.args?.methodName === 'submit' &&
            receiver.includes('aurora')) ? (
            <RlpTransaction
              pretty={modifiedData}
              method={action?.args?.methodName}
              receiver={receiver}
            />
          ) : (
            <div className="py-3">
              <textarea
                readOnly
                rows={4}
                defaultValue={displayArgs(args?.args_base64 || args)}
                className="block appearance-none outline-none w-full border dark:border-black-200 dark:bg-black-200 rounded-lg bg-gray-100 p-3 resize-y"
              ></textarea>
            </div>
          )
        ) : action?.kind === 'delegateAction' ? (
          <div className="pt-2">
            {[...action.args.actions]
              .sort(
                (actionA, actionB) =>
                  actionA.delegateIndex - actionB.delegateIndex,
              )
              .map((subaction) => (
                <ReceiptKind
                  key={subaction.delegateIndex}
                  action={subaction}
                  isTxTypeActive={true}
                  receiver={receiver}
                />
              ))}
          </div>
        ) : null
      ) : null}
    </div>
  );
};
export default ReceiptKind;
