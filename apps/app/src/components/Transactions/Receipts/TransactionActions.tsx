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
import Link from 'next/link';
import { shortenAddress } from '@/utils/libs';
import { Delegate } from '@/components/Icons/Delegate';
import { Tooltip } from '@reach/tooltip';

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
      const delegateAction: DelegateActionView | any =
        action?.args?.delegate_action?.actions &&
        action?.args?.delegate_action?.actions?.map((txn: ActionType) =>
          mapRpcActionToAction(txn),
        );
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
            {action?.args?.delegate_action?.public_key &&
              action?.args?.delegate_action?.sender_id && (
                <Tooltip
                  label={'Access key used for this receipt'}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                >
                  <span>
                    &nbsp;
                    <Link
                      href={`/address/${action?.args?.delegate_action?.sender_id}?tab=accesskeys`}
                      className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
                    >
                      (
                      {shortenAddress(
                        action?.args?.delegate_action?.public_key,
                      )}{' '}
                      )
                    </Link>
                  </span>
                </Tooltip>
              )}
          </Link>
          {delegateAction &&
            delegateAction.map((subAction: Action | any, i: number) => (
              <div className="flex flex-col" key={i}>
                <TransactionActions
                  key={i}
                  action={subAction}
                  receiver={action?.args?.delegate_action?.receiver_id}
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
