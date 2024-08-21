import { ActionPropsInfo } from '@/utils/types';
import CreateAccount from './Action/CreateAccount';
import DeleteAccount from './Action/DeleteAccount';
import DeployContract from './Action/DeployContract';
import FunctionCall from './Action/FunctionCall';
import Stake from './Action/Stake';
import Transfer from './Action/Transfer';

const Actions = (props: ActionPropsInfo) => {
  const showAction = () => {
    switch (props.action.action_kind) {
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
      default:
        return null;
    }
  };

  return <>{showAction()}</>;
};

export default Actions;
