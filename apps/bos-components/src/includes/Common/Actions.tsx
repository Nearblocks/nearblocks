import { ActionPropsInfo } from '@/includes/types';
import CreateAccount from '@/includes/Common/Action/CreateAccount';
import DeleteAccount from '@/includes/Common/Action/DeleteAccount';
import DeployContract from '@/includes/Common/Action/DeployContract';
import Stake from '@/includes/Common/Action/Stake';
import Transfer from '@/includes/Common/Action/Transfer';

const Actions = (props: ActionPropsInfo) => {
  switch (props.action.action_kind) {
    case 'CreateAccount':
      return <CreateAccount action={props.action} ownerId={props.ownerId} />;
    case 'DeleteAccount':
      return <DeleteAccount action={props.action} ownerId={props.ownerId} />;
    case 'DeployContract':
      return <DeployContract action={props.action} ownerId={props.ownerId} />;
    case 'Stake':
      return <Stake action={props.action} ownerId={props.ownerId} />;
    case 'Transfer':
      return <Transfer action={props.action} ownerId={props.ownerId} />;
    default:
      return null;
  }
};

export default Actions;
