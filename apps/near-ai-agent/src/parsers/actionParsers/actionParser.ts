import { AddKeyParser } from './addKey';
import { CreateAccountParser } from './createAccount';
import { DeleteAccountParser } from './deleteAccount';
import { DeployContractParser } from './deployContract';
import { FunctionCallParser } from './functionalCall';
import { StakeParser } from './stake';
import { TransferParser } from './transfer';
import { DeployGlobalContractParser } from './deployGlobalContract';
import { DeployGlobalContractByAccountIdParser } from './deployGlobalContactByAccountId';
import { UseGlobalContractParser } from './useGlobalContract';
import { UseGlobalContractByAccountIdParser } from './useGlobalContractByAccountId';
import { DelegateActionParser } from './delegate';
import { ParsedAction } from 'src/utils/types';
interface ActionData {
  action_kind: string;
  from: string;
  to: string;
  receiptId?: string;
  args: any;
  [key: string]: any;
}

export function parseAction(action: ActionData): ParsedAction | ParsedAction[] {
  switch (action.action_kind) {
    case 'ADD_KEY':
    case 'AddKey':
      return AddKeyParser.parse({ ...action, args: action.args?.args ?? {} });

    case 'CreateAccount':
    case 'CREATE_ACCOUNT':
      return CreateAccountParser.parse(action);

    case 'DeleteAccount':
    case 'DELETE_ACCOUNT':
      return DeleteAccountParser.parse(action);

    case 'DeployContract':
    case 'DEPLOY_CONTRACT':
      return DeployContractParser.parse(action);

    case 'DEPLOY_GLOBAL_CONTRACT':
    case 'DeployGlobalContract':
      return DeployGlobalContractParser.parse(action);

    case 'DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
    case 'DeployGlobalContractByAccountId':
      return DeployGlobalContractByAccountIdParser.parse(action);

    case 'USE_GLOBAL_CONTRACT':
    case 'UseGlobalContract':
      return UseGlobalContractParser.parse(action);

    case 'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID':
    case 'UseGlobalContractByAccountId':
      return UseGlobalContractByAccountIdParser.parse(action);

    case 'FunctionCall':
    case 'FUNCTION_CALL':
      return FunctionCallParser.parse(action);

    case 'Stake':
    case 'STAKE':
      return StakeParser.parse(action);

    case 'Transfer':
    case 'TRANSFER':
      return TransferParser.parse(action);

    case 'Delegate':
    case 'DELEGATE_ACTION':
      return DelegateActionParser.parse(action);

    default:
      return {
        type: 'UNKNOWN',
        details: {
          ...action,
          action_kind: action.action_kind,
        },
        from: action.from,
        to: action.to,
        receiptId: action.receiptId,
      };
  }
}

export const ActionParser = {
  parseAction,
};
