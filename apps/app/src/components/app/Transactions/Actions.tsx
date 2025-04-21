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
import DeployGlobalContract from './Action/DeployGlobalContract';
import DeployGlobalContractByAccountId from './Action/DeployGlobalContractByAccountId';
import UseGlobalContract from './Action/UseGlobalContract';
import UseGlobalContractByAccountId from './Action/UseGlobalContractByAccountId';

const Actions = (props: ActionPropsInfo) => {
  const showAction = () => {
    switch (props?.action?.action_kind) {
      case 'ADD_KEY':
      case 'AddKey':
        return (
          <AddKey
            action={props?.action}
            args={props?.action?.args}
            receiver={props?.action?.to}
          />
        );
      case 'CreateAccount':
      case 'CREATE_ACCOUNT':
        return <CreateAccount action={props?.action} />;
      case 'DeleteAccount':
      case 'DELETE_ACCOUNT':
        return <DeleteAccount action={props?.action} />;
      case 'DeployContract':
      case 'DEPLOY_CONTRACT':
        return <DeployContract action={props?.action} />;
      case 'DEPLOY_GLOBAL_CONTRACT':
      case 'DeployGlobalContract':
        return <DeployGlobalContract action={props?.action} />;
      case 'DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
      case 'DeployGlobalContractByAccountId':
        return <DeployGlobalContractByAccountId action={props?.action} />;
      case 'USE_GLOBAL_CONTRACT':
      case 'UseGlobalContract':
        return <UseGlobalContract action={props?.action} />;
      case 'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
      case 'UseGlobalContractByAccountId':
        return <UseGlobalContractByAccountId action={props?.action} />;
      case 'FunctionCall':
      case 'FUNCTION_CALL':
        return <FunctionCall action={props?.action} />;
      case 'Stake':
      case 'STAKE':
        return <Stake action={props?.action} />;
      case 'Transfer':
      case 'TRANSFER':
        return <Transfer action={props?.action} />;
      case 'Delegate':
      case 'DELEGATE_ACTION':
        const delegateAction: any | DelegateActionView =
          props?.action?.args?.delegate_action?.actions &&
          props?.action?.args?.delegate_action?.actions?.map(
            (txn: ActionType | any) => {
              const action = mapRpcActionToAction(txn);
              return {
                ...action,
                from: props?.action?.from,
                receiptId: props?.action?.receiptId,
                to: props?.action?.to,
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
                receiver={props?.action?.args?.delegate_action?.receiver_id}
              />
            </div>
          ))
        );
      default:
        return <div>{props?.action?.action_kind}</div>;
    }
  };

  return <>{showAction()}</>;
};

export default Actions;
