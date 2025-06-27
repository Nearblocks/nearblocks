import { mapRpcActionToAction } from '@/utils/near';
import {
  Action,
  ActionType,
  DelegateActionView,
  TransActionProps,
} from '@/utils/types';

import AddKey from '@/components/app/Transactions/TreeReceipts/Action/AddKey';
import CreateAccount from '@/components/app/Transactions/TreeReceipts/Action/CreateAccount';
import DeleteAccount from '@/components/app/Transactions/TreeReceipts/Action/DeleteAccount';
import DeleteKey from '@/components/app/Transactions/TreeReceipts/Action/DeleteKey';
import DeployContract from '@/components/app/Transactions/TreeReceipts/Action/DeployContract';
import FunctionCall from '@/components/app/Transactions/TreeReceipts/Action/FunctionCall';
import Stake from '@/components/app/Transactions/TreeReceipts/Action/Stake';
import Transfer from '@/components/app/Transactions/TreeReceipts/Action/Transfer';
import TreeNode from '@/components/app/Transactions/TreeReceipts/TreeNode';
import DeployGlobalContract from '@/components/app/Transactions/TreeReceipts/Action/DeployGlobalContract';
import DeployGlobalContractByAccountId from '@/components/app/Transactions/TreeReceipts/Action/DeployGlobalContractByAccountId';
import UseGlobalContract from '@/components/app/Transactions/TreeReceipts/Action/UseGlobalContract';
import UseGlobalContractByAccountId from '@/components/app/Transactions/TreeReceipts/Action/UseGlobalContractByAccountId';

const TreeTxnsActions = (props: TransActionProps) => {
  const { action, receiver } = props;
  switch (action?.action_kind) {
    case 'ADD_KEY':
    case 'AddKey':
      return <AddKey action={action} args={action.args} receiver={receiver} />;
    case 'CREATE_ACCOUNT':
    case 'CreateAccount':
      return (
        <CreateAccount action={action} args={action.args} receiver={receiver} />
      );
    case 'DELETE_ACCOUNT':
    case 'DeleteAccount':
      return (
        <DeleteAccount action={action} args={action.args} receiver={receiver} />
      );
    case 'DELETE_KEY':
    case 'DeleteKey':
      return (
        <DeleteKey action={action} args={action.args} receiver={receiver} />
      );
    case 'DEPLOY_CONTRACT':
    case 'DeployContract':
      return (
        <DeployContract
          action={action}
          args={action.args}
          receiver={receiver}
        />
      );

    case 'DEPLOY_GLOBAL_CONTRACT':
    case 'DeployGlobalContract':
      return (
        <DeployGlobalContract
          action={props?.action}
          receiver={receiver}
          args={action.args}
        />
      );
    case 'DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
    case 'DeployGlobalContractByAccountId':
      return (
        <DeployGlobalContractByAccountId
          action={props?.action}
          receiver={receiver}
          args={action.args}
        />
      );
    case 'USE_GLOBAL_CONTRACT':
    case 'UseGlobalContract':
      return (
        <UseGlobalContract
          action={props?.action}
          receiver={receiver}
          args={action.args}
        />
      );
    case 'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
    case 'UseGlobalContractByAccountId':
      return (
        <UseGlobalContractByAccountId
          action={props?.action}
          receiver={receiver}
          args={action.args}
        />
      );
    case 'FUNCTION_CALL':
    case 'FunctionCall':
      return (
        <FunctionCall action={action} args={action?.args} receiver={receiver} />
      );
    case 'STAKE':
    case 'Stake':
      return <Stake action={action} args={action.args} receiver={receiver} />;
    case 'TRANSFER':
    case 'Transfer':
      return (
        <Transfer action={action} args={action.args} receiver={receiver} />
      );
    case 'Delegate':
    case 'DELEGATE':
    case 'DELEGATE_ACTION':
      const delegateAction: any | DelegateActionView =
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
      return delegateAction ? (
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
      ) : (
        <div className="flex flex-col">
          <p className="text-sm font-semibold">
            Actions delegated for {receiver}
          </p>
          <div className="mt-3 bg-gray-100 dark:bg-black-200 p-3 overflow-auto rounded-lg">
            <TreeNode node={filterObject(action)} path="root" />
          </div>
        </div>
      );

    default:
      return <div>{action?.action_kind}</div>;
  }
};

export default TreeTxnsActions;
