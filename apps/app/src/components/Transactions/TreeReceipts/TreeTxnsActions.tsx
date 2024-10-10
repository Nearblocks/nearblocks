import {
  Action,
  ActionType,
  DelegateActionView,
  TransActionProps,
} from '@/utils/types';
import AddKey from './Action/AddKey';
import CreateAccount from './Action/CreateAccount';
import DeleteAccount from './Action/DeleteAccount';
import DeleteKey from './Action/DeleteKey';
import DeployContract from './Action/DeployContract';
import FunctionCall from './Action/FunctionCall';
import Stake from './Action/Stake';
import Transfer from './Action/Transfer';
import { mapRpcActionToAction } from '@/utils/near';
import TreeNode from './TreeNode';

const TreeTxnsActions = (props: TransActionProps) => {
  const { action, receiver } = props;

  switch (action?.action_kind) {
    case 'ADD_KEY':
    case 'AddKey':
      return <AddKey args={action?.args} receiver={receiver} action={action} />;
    case 'CREATE_ACCOUNT':
    case 'CreateAccount':
      return (
        <CreateAccount
          args={action?.args}
          receiver={receiver}
          action={action}
        />
      );
    case 'DELETE_ACCOUNT':
    case 'DeleteAccount':
      return (
        <DeleteAccount
          args={action?.args}
          receiver={receiver}
          action={action}
        />
      );
    case 'DELETE_KEY':
    case 'DeleteKey':
      return (
        <DeleteKey args={action?.args} receiver={receiver} action={action} />
      );
    case 'DEPLOY_CONTRACT':
    case 'DeployContract':
      return (
        <DeployContract
          args={action?.args}
          receiver={receiver}
          action={action}
        />
      );
    case 'FUNCTION_CALL':
    case 'FunctionCall':
      return (
        <FunctionCall args={action?.args} receiver={receiver} action={action} />
      );
    case 'STAKE':
    case 'Stake':
      return <Stake args={action?.args} receiver={receiver} action={action} />;
    case 'TRANSFER':
    case 'Transfer':
      return (
        <Transfer args={action?.args} receiver={receiver} action={action} />
      );
    case 'Delegate':
    case 'DELEGATE':
      const delegateAction: DelegateActionView | any =
        action?.args?.delegate_action?.actions &&
        action?.args?.delegate_action?.actions?.map((txn: ActionType) =>
          mapRpcActionToAction(txn),
        );
      function filterObject(obj: any) {
        if (obj && obj?.action_kind) {
          return {
            action_kind: obj?.action_kind,
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
              <TreeNode node={filterObject(action)} path="root" />
            </div>
          </div>
        ))
      );

    default:
      return <div>{action?.action_kind}</div>;
  }
};

export default TreeTxnsActions;
