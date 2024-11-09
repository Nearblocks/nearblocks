import { mapRpcActionToAction } from '@/utils/near';
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

const TransactionActions = (props: TransActionProps) => {
  const { action, receiver } = props;

  switch (action.action_kind) {
    case 'ADD_KEY':
    case 'AddKey':
      return <AddKey args={action.args} receiver={receiver} />;
    case 'CREATE_ACCOUNT':
    case 'CreateAccount':
      return <CreateAccount args={action.args} receiver={receiver} />;
    case 'DELETE_ACCOUNT':
    case 'DeleteAccount':
      return <DeleteAccount args={action.args} receiver={receiver} />;
    case 'DELETE_KEY':
    case 'DeleteKey':
      return <DeleteKey args={action.args} receiver={receiver} />;
    case 'DEPLOY_CONTRACT':
    case 'DeployContract':
      return <DeployContract args={action.args} receiver={receiver} />;
    case 'FUNCTION_CALL':
    case 'FunctionCall':
      return <FunctionCall args={action.args} receiver={receiver} />;
    case 'STAKE':
    case 'Stake':
      return <Stake args={action.args} receiver={receiver} />;
    case 'TRANSFER':
    case 'Transfer':
      return <Transfer args={action.args} receiver={receiver} />;
    case 'Delegate':
    case 'DELEGATE':
      const delegateAction: any | DelegateActionView =
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
              action={subAction}
              key={i}
              receiver={action?.args?.delegate_action?.receiver_id}
            />
          </div>
        ))
      );

    default:
      return <div>{action.action_kind}</div>;
  }
};

export default TransactionActions;
