import { hexy } from '@/includes/hexy';
import FaCode from '@/includes/icons/FaCode';
import { TransactionActionInfo } from '@/includes/types';

const FunctionCall = (props: TransactionActionInfo) => {
  const { t, args, receiver, action, ownerId } = props;
  const { shortenAddress } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  function displayArgs(args: any) {
    if (!args || typeof args === 'undefined') return 'The arguments are empty';

    let pretty: any = '';
    const decoded = Buffer.from(args, 'base64');
    try {
      const parsed = JSON.parse(decoded.toString());
      if (parsed) {
        pretty = parsed;
      } else {
        pretty = hexy(decoded, { format: 'twos' });
      }
    } catch {
      pretty = hexy(decoded, { format: 'twos' });
    }

    if (pretty && typeof pretty === 'object' && pretty.msg) {
      try {
        const msgObj = JSON.parse(pretty.msg);
        pretty.msg = msgObj;
      } catch (error) {
        console.error('Error parsing JSON in "msg" property:', error);
      }
    }

    return pretty;
  }

  const modifiedAction = {
    ...action,
    args: {
      ...action.args,
      args: displayArgs(args?.args_base64 || args?.args),
    },
  };
  return (
    <>
      <div className="py-1">
        <FaCode className="inline-flex text-yellow-500 mr-1" />
        {t ? t('txns:txn.actions.functionCall.0') : 'Called method'}
        <span className="font-bold">{args?.method_name}</span>{' '}
        {t ? t('txns:txn.actions.functionCall.1') : 'in contract'}
        <a href={`/address/${receiver}`} className="hover:no-underline">
          <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
            {shortenAddress(receiver)}
          </a>
        </a>
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 p-3 overflow-auto rounded-lg">
        <Widget
          src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
          props={{
            node: modifiedAction,
            path: 'root',
            ownerId,
          }}
        />
      </div>
    </>
  );
};

export default FunctionCall;
