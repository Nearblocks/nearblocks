import FaUser from '@/includes/icons/FaUser';

const CreateAccount = (props: any) => {
  const { shortenAddress } = VM.require(
    `${props.ownerId}/widget/includes.Utils.libs`,
  );

  return (
    <div className="py-1">
      <FaUser className="inline-flex text-emerald-400 mr-1" />{' '}
      {props.t ? props.t('txns:txn.actions.createAccount.0') : 'New account'} (
      <a href={`/address/${props.receiver}`} className="hover:no-underline">
        <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
          {shortenAddress(props.receiver)}
        </a>
      </a>
      ) {props.t ? props.t('txns:txn.actions.createAccount.1') : 'created'}
    </div>
  );
};

export default CreateAccount;
