import { hexy } from '@/includes/hexy';
import FaCode from '@/includes/icons/FaCode';
import { shortenAddress } from '@/includes/libs';
import { TransactionActionInfo } from '@/includes/types';

const FunctionCall = (props: TransactionActionInfo) => {
  const { t, args, receiver } = props;

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

  return (
    <div className="py-1">
      <FaCode className="inline-flex text-yellow-500 mr-1" />
      {t ? t('txns:txn.actions.functionCall.0') : 'Called method'}
      <span className="font-bold">{args?.method_name}</span>{' '}
      {t ? t('txns:txn.actions.functionCall.1') : 'in contract'}
      <a href={`/address/${receiver}`} className="hover:no-underline">
        <a className="text-green-500 font-bold hover:no-underline">
          {shortenAddress(receiver)}
        </a>
      </a>
      <textarea
        readOnly
        rows={4}
        defaultValue={displayArgs(args?.args_base64 || args?.args)}
        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 p-3 mt-3 resize-y"
      ></textarea>
    </div>
  );
};

export default FunctionCall;
