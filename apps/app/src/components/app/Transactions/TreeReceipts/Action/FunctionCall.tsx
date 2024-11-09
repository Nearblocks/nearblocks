import { useTranslations } from 'next-intl';

import FaCode from '@/components/Icons/FaCode';
import { Link } from '@/i18n/routing';
import { hexy } from '@/utils/hexy';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '../TreeNode';

const FunctionCall = (props: TransactionActionInfo) => {
  const { action, args, receiver } = props;
  const t = useTranslations();

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
        {t ? t('txn.actions.functionCall.0') : 'Called method'}
        <span className="font-bold ml-1">{args?.method_name}</span>{' '}
        {t ? t('txn.actions.functionCall.1') : 'in contract'}
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
          href={`/address/${receiver}`}
        >
          {shortenAddress(receiver)}
        </Link>
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 p-3 overflow-auto rounded-lg">
        <TreeNode node={modifiedAction} path="root" />
      </div>
    </>
  );
};

export default FunctionCall;
