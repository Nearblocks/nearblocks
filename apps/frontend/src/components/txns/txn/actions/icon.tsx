import {
  Coins,
  Globe,
  Info,
  Key,
  Layers,
  Link,
  Rocket,
  Send,
  Share2,
  Terminal,
  Trash2,
  UserRoundPlus,
  UserX,
} from 'lucide-react';

import { Txn } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { Badge } from '@/ui/badge';

type Props = {
  actions: null | Txn['actions'];
};

type IconProps = {
  className?: string;
  type: ActionKind;
};

const variants = (action: ActionKind) => {
  switch (action) {
    case ActionKind.ADD_KEY:
    case ActionKind.CREATE_ACCOUNT:
    case ActionKind.DETERMINISTIC_STATE_INIT:
      return 'lime';
    case ActionKind.FUNCTION_CALL:
      return 'blue';
    case ActionKind.STAKE:
    case ActionKind.TRANSFER:
      return 'amber';
    case ActionKind.DELEGATE_ACTION:
    case ActionKind.DEPLOY_CONTRACT:
    case ActionKind.DEPLOY_GLOBAL_CONTRACT:
    case ActionKind.DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
    case ActionKind.USE_GLOBAL_CONTRACT:
    case ActionKind.USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
      return 'purple';
    case ActionKind.DELETE_ACCOUNT:
    case ActionKind.DELETE_KEY:
      return 'red';
    default:
      return 'gray';
  }
};

const badgeClass = 'rounded-full size-10 p-0';

export const Icon = ({ actions }: Props) => {
  if (!actions || actions?.length === 0) {
    return (
      <Badge className={badgeClass} variant="gray">
        <ActionIcon className="size-4!" type={ActionKind.UNKNOWN} />
      </Badge>
    );
  }

  const variant = variants(actions[0].action);

  if (actions?.length === 1) {
    return (
      <Badge className={badgeClass} variant={variant}>
        <ActionIcon className="size-4!" type={actions[0].action} />
      </Badge>
    );
  }

  if (actions?.[0].action === ActionKind.DELEGATE_ACTION) {
    return (
      <Badge className={badgeClass} variant={variant}>
        <ActionIcon className="size-4!" type={ActionKind.DELEGATE_ACTION} />
      </Badge>
    );
  }

  return (
    <Badge className={badgeClass} variant="purple">
      <Layers className="size-4!" />
    </Badge>
  );
};

export const ActionIcon = ({ className, type }: IconProps) => {
  switch (type) {
    case ActionKind.TRANSFER:
      return <Send className={className} />;
    case ActionKind.STAKE:
      return <Coins className={className} />;
    case ActionKind.FUNCTION_CALL:
      return <Terminal className={className} />;
    case ActionKind.ADD_KEY:
      return <Key className={className} />;
    case ActionKind.DELETE_KEY:
      return <Trash2 className={className} />;
    case ActionKind.DEPLOY_CONTRACT:
      return <Rocket className={className} />;
    case ActionKind.DEPLOY_GLOBAL_CONTRACT:
      return <Globe className={className} />;
    case ActionKind.DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
      return <Globe className={className} />;
    case ActionKind.CREATE_ACCOUNT:
      return <UserRoundPlus className={className} />;
    case ActionKind.DELETE_ACCOUNT:
      return <UserX className={className} />;
    case ActionKind.DELEGATE_ACTION:
      return <Share2 className={className} />;
    case ActionKind.USE_GLOBAL_CONTRACT:
    case ActionKind.USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
      return <Link className={className} />;
    default:
      return <Info className={className} />;
  }
};
