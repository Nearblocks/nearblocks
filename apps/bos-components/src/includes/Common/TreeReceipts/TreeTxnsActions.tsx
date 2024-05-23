import AddKey from '@/includes/Common/TreeReceipts/Action/AddKey';
import CreateAccount from '@/includes/Common/TreeReceipts/Action/CreateAccount';
import {
  Action,
  ActionType,
  DelegateActionView,
  TransActionProps,
} from '@/includes/types';
import DeleteAccount from '@/includes/Common/TreeReceipts/Action/DeleteAccount';
import DeleteKey from '@/includes/Common/TreeReceipts/Action/DeleteKey';
import DeployContract from '@/includes/Common/TreeReceipts/Action/DeployContract';
import FunctionCall from '@/includes/Common/TreeReceipts/Action/FunctionCall';
import Stake from '@/includes/Common/TreeReceipts/Action/Stake';
import Transfer from '@/includes/Common/TreeReceipts/Action/Transfer';

const TreeTxnsActions = (props: TransActionProps) => {
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
          action={action}
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
          action={action}
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
          action={action}
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
          action={action}
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
          action={action}
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
          action={action}
        />
      );
    case 'STAKE':
    case 'Stake':
      return (
        <Stake
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
          action={action}
        />
      );
    case 'TRANSFER':
    case 'Transfer':
      return (
        <Transfer
          args={action.args}
          receiver={receiver}
          t={t}
          ownerId={ownerId}
          action={action}
        />
      );
    case 'Delegate':
    case 'DELEGATE':
      const delegateAction: DelegateActionView | any =
        action?.args?.delegate_action?.actions &&
        action?.args?.delegate_action?.actions?.map((txn: ActionType) =>
          mapRpcActionToAction(txn),
        );
      function filterObject(obj: any) {
        if (obj && obj.action_kind) {
          return {
            action_kind: obj.action_kind,
          };
        } else {
          return {
            action_kind: {},
          };
        }
      }
      return (
        delegateAction &&
        delegateAction.map((_subAction: Action | any, i: number) => (
          <div className="flex flex-col" key={i}>
            <p className="text-sm font-semibold">
              Actions delegated for {receiver}
            </p>
            <div className="mt-3 bg-gray-100 dark:bg-black-200 p-3 overflow-auto rounded-lg">
              <Widget
                src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
                props={{
                  node: filterObject(action),
                  path: 'root',
                  ownerId,
                }}
              />
            </div>
          </div>
        ))
      );

    default:
      return <div>{action.action_kind}</div>;
  }
};

export default TreeTxnsActions;
