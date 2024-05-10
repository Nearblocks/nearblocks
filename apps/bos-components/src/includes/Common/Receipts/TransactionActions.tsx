import AddKey from '@/includes/Common/Receipts/Action/AddKey';
import CreateAccount from '@/includes/Common/Receipts/Action/CreateAccount';
import {
  Action,
  ActionType,
  DelegateActionView,
  TransActionProps,
} from '@/includes/types';
import DeleteAccount from '@/includes/Common/Receipts/Action/DeleteAccount';
import DeleteKey from '@/includes/Common/Receipts/Action/DeleteKey';
import DeployContract from '@/includes/Common/Receipts/Action/DeployContract';
import FunctionCall from '@/includes/Common/Receipts/Action/FunctionCall';
import Stake from '@/includes/Common/Receipts/Action/Stake';
import Transfer from '@/includes/Common/Receipts/Action/Transfer';

const TransactionActions = (props: TransActionProps) => {
  const { action, receiver, t, ownerId } = props;
  const { mapRpcActionToAction } = VM.require(
    `${ownerId}/widget/includes.Utils.near`,
  );

  switch (action.action_kind) {
    case 'ADD_KEY':
    case 'AddKey':
      return (
        <AddKey
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
        />
      );
    case 'CREATE_ACCOUNT':
    case 'CreateAccount':
      return (
        <CreateAccount
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
        />
      );
    case 'DELETE_ACCOUNT':
    case 'DeleteAccount':
      return (
        <DeleteAccount
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
        />
      );
    case 'DELETE_KEY':
    case 'DeleteKey':
      return (
        <DeleteKey
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
        />
      );
    case 'DEPLOY_CONTRACT':
    case 'DeployContract':
      return (
        <DeployContract
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
        />
      );
    case 'FUNCTION_CALL':
    case 'FunctionCall':
      return (
        <FunctionCall
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
        />
      );
    case 'STAKE':
    case 'Stake':
      return (
        <Stake args={action.args} receiver={receiver} t={t} ownerId={ownerId} />
      );
    case 'TRANSFER':
    case 'Transfer':
      return (
        <Transfer
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
        />
      );
    case 'Delegate':
    case 'DELEGATE':
      const delegateAction: DelegateActionView | any =
        action?.args?.delegate_action?.actions &&
        action?.args?.delegate_action?.actions?.map((txn: ActionType) =>
          mapRpcActionToAction(txn),
        );
      return (
        delegateAction &&
        delegateAction.map((subAction: Action | any, i: number) => (
          <div className="flex flex-col" key={i}>
            <p className="text-sm font-semibold">
              Actions delegated for {receiver}
            </p>
            <TransactionActions
              key={i}
              action={subAction}
              receiver={action?.args?.delegate_action?.receiver_id}
              t={t}
              ownerId={ownerId}
            />
          </div>
        ))
      );

    default:
      return <div>{action.action_kind}</div>;
  }
};

export default TransactionActions;
