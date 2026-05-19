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

import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';

type Props = {
  actions: null | Txn['actions'];
};

type IconProps = {
  action: ActionKind;
  className?: string;
};

const variants = (action: ActionKind) => {
  switch (action) {
    case ActionKind.ADD_KEY:
    case ActionKind.CREATE_ACCOUNT:
    case ActionKind.DETERMINISTIC_STATE_INIT:
      return { bg: 'bg-lime-background', color: 'text-lime-foreground' };
    case ActionKind.FUNCTION_CALL:
      return { bg: 'bg-blue-background', color: 'text-blue-foreground' };
    case ActionKind.STAKE:
    case ActionKind.TRANSFER:
      return { bg: 'bg-amber-background', color: 'text-amber-foreground' };
    case ActionKind.DELEGATE_ACTION:
    case ActionKind.DEPLOY_CONTRACT:
    case ActionKind.DEPLOY_GLOBAL_CONTRACT:
    case ActionKind.DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
    case ActionKind.USE_GLOBAL_CONTRACT:
    case ActionKind.USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
      return { bg: 'bg-purple-background', color: 'text-purple-foreground' };
    case ActionKind.DELETE_ACCOUNT:
    case ActionKind.DELETE_KEY:
      return { bg: 'bg-red-background', color: 'text-red-foreground' };
    default:
      return { bg: 'bg-gray-background', color: 'text-gray-foreground' };
  }
};

const badgeClass = 'rounded-full size-10 p-0';

export const TxnIcon = ({ actions }: Props) => {
  if (!actions || actions?.length === 0) {
    return (
      <Badge className={badgeClass} variant="gray">
        <ActionIcon action={ActionKind.UNKNOWN} className="size-4!" />
      </Badge>
    );
  }

  const variant = variants(actions[0].action);

  if (actions?.length === 1) {
    return (
      <Badge className={cn(badgeClass, variant.bg, variant.color)}>
        <ActionIcon action={actions[0].action} className="size-4!" />
      </Badge>
    );
  }

  if (actions?.[0].action === ActionKind.DELEGATE_ACTION) {
    return (
      <Badge className={cn(badgeClass, variant.bg, variant.color)}>
        <ActionIcon action={ActionKind.DELEGATE_ACTION} className="size-4!" />
      </Badge>
    );
  }

  return (
    <Badge className={badgeClass} variant="purple">
      <Layers className="size-4!" />
    </Badge>
  );
};

export const ReceiptIcon = ({ action, className }: IconProps) => {
  const variant = variants(action);

  return (
    <ActionIcon action={action} className={cn(className, variant.color)} />
  );
};

export const ActionIcon = ({ action, className }: IconProps) => {
  switch (action) {
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
