import FaArrowAltCircleRight from '@/includes/icons/FaArrowAltCircleRight';
import { TransactionActionInfo } from '@/includes/types';

const Transfer = (props: TransactionActionInfo) => {
  const networkAccountId =
    context.networkId === 'mainnet' ? 'nearblocks.near' : 'nearblocks.testnet';

  const { shortenAddress, yoctoToNear } = VM.require(
    `${networkAccountId}/widget/includes.Utils.libs`,
  );

  const { t, args, receiver } = props;

  return (
    <div className="py-1">
      <FaArrowAltCircleRight className="inline-flex text-green-400 mr-1" />{' '}
      {t ? t('txns:txn.actions.transfer.0') : 'Transferred'}
      <span className="font-bold">
        {args.deposit ? yoctoToNear(args.deposit, true) : args.deposit ?? ''} Ⓝ
      </span>{' '}
      {t ? t('txns:txn.actions.transfer.1') : 'to'}
      <a href={`/address/${receiver}`} className="hover:no-underline">
        <a className="text-green-500 font-bold hover:no-underline">
          {shortenAddress(receiver)}
        </a>
      </a>
    </div>
  );
};

export default Transfer;
