import { mapRpcActionToAction } from '@/utils/near';
import {
  Action,
  ActionType,
  DelegateActionView,
  TransActionProps,
} from '@/utils/types';

import AddKey from '@/components/app/Transactions/Receipts/Action/AddKey';
import CreateAccount from '@/components/app/Transactions/Receipts/Action/CreateAccount';
import DeleteAccount from '@/components/app/Transactions/Receipts/Action/DeleteAccount';
import DeleteKey from '@/components/app/Transactions/Receipts/Action/DeleteKey';
import DeployContract from '@/components/app/Transactions/Receipts/Action/DeployContract';
import FunctionCall from '@/components/app/Transactions/Receipts/Action/FunctionCall';
import Stake from '@/components/app/Transactions/Receipts/Action/Stake';
import Transfer from '@/components/app/Transactions/Receipts/Action/Transfer';
import { Delegate } from '@/components/app/Icons/Delegate';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/app/libs';
import Tooltip from '@/components/app/common/Tooltip';
import DeployGlobalContract from '@/components/app/Transactions/Receipts/Action/DeployGlobalContract';
import DeployGlobalContractByAccountId from '@/components/app/Transactions/Receipts/Action/DeployGlobalContractByAccountId';
import UseGlobalContract from '@/components/app/Transactions/Receipts/Action/UseGlobalContract';
import UseGlobalContractByAccountId from '@/components/app/Transactions/Receipts/Action/UseGlobalContractByAccountId';
import { CopyButton } from '../../common/CopyButton';

const TransactionActions = (props: TransActionProps) => {
  const { action, receiver, rpcAction } = props;
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
    case 'DEPLOY_GLOBAL_CONTRACT':
    case 'DeployGlobalContract':
      return <DeployGlobalContract args={action.args} receiver={receiver} />;
    case 'DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
    case 'DeployGlobalContractByAccountId':
      return (
        <DeployGlobalContractByAccountId
          args={action.args}
          receiver={receiver}
        />
      );
    case 'USE_GLOBAL_CONTRACT':
    case 'UseGlobalContract':
      return <UseGlobalContract args={action.args} receiver={receiver} />;
    case 'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
    case 'UseGlobalContractByAccountId':
      return (
        <UseGlobalContractByAccountId args={action.args} receiver={receiver} />
      );
    case 'FUNCTION_CALL':
    case 'FunctionCall':
      return (
        <FunctionCall
          args={action.args}
          receiver={receiver}
          rpcAction={rpcAction}
        />
      );
    case 'STAKE':
    case 'Stake':
      return <Stake args={action.args} receiver={receiver} />;
    case 'TRANSFER':
    case 'Transfer':
      return <Transfer args={action.args} receiver={receiver} />;
    case 'Delegate':
    case 'DELEGATE':
    case 'DELEGATE_ACTION':
      const delegateAction: any | DelegateActionView =
        action?.args?.delegateAction?.actions &&
        action?.args?.delegateAction?.actions?.map((txn: ActionType) =>
          mapRpcActionToAction(txn),
        );
      const regularPublicKey =
        action?.args?.public_key || action?.args?.publicKey;
      const delegatePublicKey =
        action?.args?.delegateAction?.public_key ||
        action?.args?.delegateAction?.publicKey;
      const regularSenderId = action?.args?.sender_id || action?.args?.senderId;
      const delegateSenderId =
        action?.args?.delegateAction?.sender_id ||
        action?.args?.delegateAction?.senderId;

      const publicKey = regularPublicKey || delegatePublicKey;
      const senderId = regularSenderId || delegateSenderId;

      return (
        <div className="py-1">
          <Delegate className="inline-flex text-yellow-500" />
          &nbsp;Actions
          <span className="font-bold ml-1">delegated</span> for
          <Link
            href={`/address/${receiver}`}
            className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
          >
            {shortenAddress(receiver)}
          </Link>
          {publicKey && senderId && (
            <span>
              &nbsp; (
              <Link
                href={`/address/${senderId}?tab=accesskeys`}
                className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
              >
                <Tooltip
                  tooltip={publicKey}
                  position="top"
                  className={
                    'left-1/2 sm:-ml-10 w-[calc(100vw-10rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
                  }
                  showArrow
                >
                  {shortenAddress(publicKey)}
                </Tooltip>
              </Link>
              <span>
                <CopyButton textToCopy={publicKey} />
              </span>
              )
            </span>
          )}
          {delegateAction &&
            delegateAction.map((subAction: Action | any, i: number) => (
              <div className="flex flex-col" key={i}>
                <TransactionActions
                  key={i}
                  action={subAction}
                  receiver={
                    action?.args?.delegate_action?.receiver_id ||
                    action?.args?.delegateAction?.receiverId
                  }
                  rpcAction={rpcAction}
                />
              </div>
            ))}
        </div>
      );

    default:
      return <div>{action.action_kind}</div>;
  }
};

export default TransactionActions;
