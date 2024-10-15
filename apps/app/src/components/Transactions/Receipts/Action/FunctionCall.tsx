import FaCode from '@/components/Icons/FaCode';
import { hexy } from '@/utils/hexy';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import RlpTransaction from '../RlpTransaction';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const FunctionCall = (props: TransactionActionInfo) => {
  const t = useTranslations();
  const { args, receiver } = props;

  function displayArgs(args: any) {
    if (!args || typeof args === 'undefined') return 'The arguments are empty';

    let pretty = '';
    const decoded = Buffer.from(args, 'base64');
    try {
      const parsed = JSON.parse(decoded?.toString());
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

  const modifiedData =
    args?.method_name === 'submit' && receiver?.includes('aurora')
      ? { tx_bytes_b64: args.args_base64 || args.args }
      : args.args_base64 || args.args;

  return (
    <div className="py-1">
      <FaCode className="inline-flex text-yellow-500 mr-1" />
      {t ? t('txn.actions.functionCall.0') : 'Called method'}
      <span className="font-bold ml-1">{args?.method_name}</span>{' '}
      {t ? t('txn.actions.functionCall.1') : 'in contract'}
      <Link
        href={`/address/${receiver}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
      >
        {shortenAddress(receiver)}
      </Link>
      {args?.method_name === 'rlp_execute' ||
      (args?.method_name === 'submit' && receiver?.includes('aurora')) ? (
        <RlpTransaction
          pretty={modifiedData}
          method={args?.method_name}
          receiver={receiver}
        />
      ) : (
        <textarea
          readOnly
          rows={4}
          defaultValue={displayArgs(args?.args_base64 || args?.args)}
          className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
        ></textarea>
      )}
    </div>
  );
};

export default FunctionCall;
