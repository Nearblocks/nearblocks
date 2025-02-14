import { ActionType } from '@near-wallet-selector/core';
import { Action } from 'near-api-js/lib/transaction';

import { mapRpcActionToAction } from '@/utils/near';
import { ActionPropsInfo, DelegateActionView } from '@/utils/types';

import AddKey from './Action/AddKey';
import CreateAccount from './Action/CreateAccount';
import DeleteAccount from './Action/DeleteAccount';
import DeployContract from './Action/DeployContract';
import FunctionCall from './Action/FunctionCall';
import Stake from './Action/Stake';
import Transfer from './Action/Transfer';

const Actions = (props: ActionPropsInfo) => {
  console.log('enter actions');
  console.log({ action_kind: props?.action?.action_kind });
  const showAction = () => {
    switch (props.action.action_kind) {
      case 'ADD_KEY':
      case 'AddKey':
        return (
          <AddKey
            action={props.action}
            args={props.action.args}
            receiver={props.action?.to}
          />
        );
      case 'CreateAccount':
        return <CreateAccount action={props.action} />;
      case 'DeleteAccount':
        return <DeleteAccount action={props.action} />;
      case 'DeployContract':
        return <DeployContract action={props.action} />;
      case 'FunctionCall':
      case 'FUNCTION_CALL':
        return <FunctionCall action={props.action} />;
      case 'Stake':
        return <Stake action={props.action} />;
      case 'Transfer':
      case 'TRANSFER':
        return <Transfer action={props.action} />;
      case 'Delegate':
      case 'DELEGATE_ACTION':
        const delegateAction: any | DelegateActionView =
          props.action?.args?.delegate_action?.actions &&
          props.action?.args?.delegate_action?.actions?.map(
            (txn: ActionType | any) => {
              const action = mapRpcActionToAction(txn);
              return {
                ...action,
                from: props.action?.from,
                receiptId: props.action?.receiptId,
                to: props.action?.to,
              };
            },
          );

        return (
          delegateAction &&
          delegateAction.map((subAction: Action | any, i: number) => (
            <div className="flex flex-col" key={i}>
              <Actions
                action={subAction}
                key={i}
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
