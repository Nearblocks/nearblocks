import { ActionPropsInfo, DelegateActionView } from '@/utils/types';
import CreateAccount from './Action/CreateAccount';
import DeleteAccount from './Action/DeleteAccount';
import DeployContract from './Action/DeployContract';
import FunctionCall from './Action/FunctionCall';
import Stake from './Action/Stake';
import Transfer from './Action/Transfer';
import AddKey from './Action/AddKey';
import { ActionType } from '@near-wallet-selector/core';
import { mapRpcActionToAction } from '@/utils/near';
import { Action } from 'near-api-js/lib/transaction';

const Actions = (props: ActionPropsInfo) => {
  const showAction = () => {
    switch (props.action.action_kind) {
      case 'ADD_KEY':
      case 'AddKey':
        return <AddKey args={props.action.args} receiver={props.action?.to} />;
      case 'CreateAccount':
        return <CreateAccount action={props.action} />;
      case 'DeleteAccount':
        return <DeleteAccount action={props.action} />;
      case 'DeployContract':
        return <DeployContract action={props.action} />;
      case 'FunctionCall':
        return <FunctionCall action={props.action} />;
      case 'Stake':
        return <Stake action={props.action} />;
      case 'Transfer':
        return <Transfer action={props.action} />;
      case 'Delegate':
      case 'DELEGATE':
        const delegateAction: DelegateActionView | any =
          props.action?.args?.delegate_action?.actions &&
          props.action?.args?.delegate_action?.actions?.map(
            (txn: ActionType | any) => mapRpcActionToAction(txn),
          );
        return (
          delegateAction &&
          delegateAction.map((subAction: Action | any, i: number) => (
            <div className="flex flex-col" key={i}>
              <Actions
                key={i}
                action={subAction}
                receiver={props.action?.args?.delegate_action?.receiver_id}
              />
            </div>
          ))
        );
      default:
        return <div>{props.action.action_kind}</div>;
    }
  };

  return <>{showAction()}</>;
};

export default Actions;
