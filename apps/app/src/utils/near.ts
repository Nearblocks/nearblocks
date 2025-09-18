import Big from 'big.js';

import {
  Action,
  ActionError,
  ActionInfo,
  ActionType,
  ApiTransaction,
  FailedToFindReceipt,
  InvalidTxError,
  NestedReceiptWithOutcome,
  NetworkType,
  NonDelegateAction,
  NonDelegateActionView,
  Obj,
  ParsedReceipt,
  ProcessedTokenMeta,
  ReceiptAction,
  ReceiptApiResponse,
  ReceiptTree,
  RPCCompilationError,
  RPCFunctionCallError,
  RPCInvalidAccessKeyError,
  RPCNewReceiptValidationError,
  TransactionInfo,
  TransactionLog,
  TransformedReceipt,
  TxExecutionError,
} from '@/utils/types';
import { intentsAddressList, supportedNetworks } from './app/config';
import { isValidJson, parseEventJson } from './libs';
import { getRequest } from './app/api';
import { cleanNestedObject } from './app/libs';
import { RpcTransactionResponse } from '@near-js/jsonrpc-types';

export function localFormat(number: string) {
  const bigNumber = Big(number);
  const formattedNumber = bigNumber
    .toFixed(5)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point
  return formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
}
export function dollarFormat(number: string) {
  const bigNumber = new Big(number);

  // Format to two decimal places without thousands separator
  const formattedNumber = bigNumber.toFixed(2);

  // Add comma as a thousands separator
  const parts = formattedNumber && formattedNumber.split('.');
  if (parts) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const dollarFormattedNumber = parts && `${parts.join('.')}`;

  return dollarFormattedNumber;
}
export function yoctoToNear(yocto: string, format: boolean) {
  const YOCTO_PER_NEAR = Big(10).pow(24)?.toString();

  const near = Big(yocto).div(YOCTO_PER_NEAR)?.toString();

  return format ? localFormat(near) : near;
}
export function gasPrice(yacto: string) {
  const near = Big(yoctoToNear(yacto, false)).mul(Big(10).pow(12))?.toString();

  return `${localFormat(near)} Ⓝ / Tgas`;
}

export function encodeArgs(args: object) {
  if (!args || typeof args === 'undefined') return '';

  return Buffer.from(JSON.stringify(args))?.toString('base64');
}

export function decodeArgs(args: string[]) {
  if (!args || typeof args === 'undefined') return {};
  // @ts-ignore
  return JSON.parse(Buffer.from(args, 'base64')?.toString());
}

export function tokenAmount(amount: string, decimal: string, format: boolean) {
  if (amount === undefined || amount === null) return 'N/A';
  // @ts-ignore
  const near = Big(amount).div(Big(10).pow(decimal));

  const formattedValue = format
    ? near.toFixed(8).replace(/\.?0+$/, '')
    : // @ts-ignore
      near.toFixed(Big(decimal, 10)).replace(/\.?0+$/, '');

  return formattedValue;
}

export const txnMethod = (
  actions: { action: string; method: string }[],
  t?: (key: string, options?: { count?: string | undefined }) => string,
) => {
  const count = actions?.length || 0;

  if (!count) return t ? t('unknownType') : 'Unknown';
  if (count > 1) return t ? t('batchTxns') : 'Batch Transaction';

  const action = actions[0];

  if (action?.action === 'FUNCTION_CALL') {
    return action?.method;
  }

  return action?.action;
};

export function price(amount: string, decimal: string, price: string) {
  // @ts-ignore
  const nearAmount = Big(amount).div(Big(10).pow(decimal));
  return dollarFormat(nearAmount?.mul(Big(price || 0))?.toString());
}

export function tokenPercentage(
  supply: string,
  amount: string,
  decimal: string,
) {
  // @ts-ignore
  const nearAmount = Big(amount).div(Big(10).pow(decimal));
  const nearSupply = Big(supply);

  return nearAmount.div(nearSupply).mul(Big(100)).toFixed(2) === '0.00'
    ? '0'
    : nearAmount.div(nearSupply).mul(Big(100)).toFixed(2);
}

export function txnLogs(txn: RpcTransactionResponse): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receiptsOutcome || [];

  for (let i = 1; i < outcomes?.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs?.length > 0) {
      const mappedLogs: TransactionLog[] = logs?.map((log: string) => ({
        contract: outcome?.outcome?.executorId || '',
        logs: log,
        receiptId: outcome?.id,
      }));
      txLogs = [...txLogs, ...mappedLogs];
    }
  }
  return txLogs;
}

export function apiTxnLogs(txn: any): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receipts || [];

  for (let i = 0; i < outcomes?.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs?.length > 0) {
      const mappedLogs: TransactionLog[] = logs?.map((log: string) => ({
        contract: outcome?.outcome?.executor_account_id || '',
        logs: parseEventJson(log),
        receiptId: outcome?.receipt_id,
      }));
      txLogs = [...txLogs, ...mappedLogs];
    }
  }
  return txLogs;
}

export function txnActionLogs(txn: RpcTransactionResponse): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receiptsOutcome || [];

  for (let i = 0; i < outcomes?.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs.length > 0) {
      const mappedLogs: TransactionLog[] = logs?.map((log: string) => ({
        contract: outcome?.outcome?.executorId || '',
        logs: log,
        receiptId: outcome?.id,
      }));
      txLogs = [...txLogs, ...mappedLogs];
    }
  }
  return txLogs;
}

export function mapRpcActionToAction(action: string | ActionType) {
  if (action === 'CreateAccount') {
    return {
      action_kind: 'CreateAccount',
      args: {},
    };
  }

  if (typeof action === 'object') {
    const kind = action && Object.keys(action)[0];

    return {
      action_kind: kind,
      args: action[kind],
    };
  }

  return null;
}

export function txnActions(txn: RpcTransactionResponse) {
  const txActions: any = [];

  if (!('receipts' in txn) || !txn.receipts) {
    return txActions;
  }

  const receipts = txn.receipts;

  for (let i = 1; i < receipts?.length; i++) {
    const receipt = receipts[i];
    const from = receipt?.predecessorId;
    const to = receipt?.receiverId;
    const receiptId = receipt?.receiptId;

    if (from === 'system') continue;

    if (Array.isArray(receipt?.receipt)) {
      const actions = receipt?.receipt;

      for (let j = 0; j < actions?.length; j++) {
        const action = actions[j];
        txActions?.push({ from, to, receiptId, ...action });
      }
    } else {
      if ('Action' in receipt.receipt) {
        const actions = receipt.receipt.Action?.actions || [];
        for (let j = 0; j < actions?.length; j++) {
          const action = mapRpcActionToAction(actions[j]);
          txActions.push({ from, to, receiptId, ...action });
        }
      }
    }
  }

  return txActions;
}

export function txnAllActions(txn: RpcTransactionResponse) {
  const txActions: any = [];
  if (!('receipts' in txn) || !txn.receipts) {
    return txActions;
  }
  const receipts = txn?.receipts || [];

  for (let i = 0; i < receipts?.length; i++) {
    const receipt = receipts[i];
    const from = receipt?.predecessorId;
    const to = receipt?.receiverId;
    const receiptId = receipt?.receiptId;

    if (from === 'system') continue;

    if (Array.isArray(receipt?.receipt)) {
      const actions = receipt.receipt;

      for (let j = 0; j < actions.length; j++) {
        const action = actions[j];

        txActions.push({ from, to, receiptId, ...action });
      }
    } else {
      if ('Action' in receipt.receipt) {
        const actions = receipt?.receipt?.Action?.actions || [];

        for (let j = 0; j < actions.length; j++) {
          const action = mapRpcActionToAction(actions[j]);

          txActions.push({ from, to, receiptId, ...action });
        }
      }
    }
  }

  return txActions;
}

function parseNestedJSON(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => parseNestedJSON(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      try {
        result[key] = JSON.parse(obj[key]);
      } catch {
        result[key] = obj[key];
      }
    } else if (typeof obj[key] === 'object') {
      result[key] = parseNestedJSON(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

function displayArgs(args: any) {
  if (!args || typeof args === 'undefined') return 'The arguments are empty';

  let decoded;
  try {
    decoded = Buffer.from(args, 'base64');
  } catch (e) {
    return '';
  }

  let pretty = '';
  const decodedStr = decoded.toString();

  if (isValidJson(decodedStr)) {
    try {
      const parsed = JSON.parse(decodedStr);

      const parsedWithNestedJSON = parseNestedJSON(parsed);

      pretty = JSON.stringify(parsedWithNestedJSON, null, 2);
    } catch (err) {
      return '';
    }
  }
  return pretty;
}

export function mainActions(rpcTxn: RpcTransactionResponse) {
  const txActions = [];
  const transaction = rpcTxn?.transaction?.actions || [];
  const receipt = rpcTxn?.transactionOutcome?.outcome?.receiptIds?.[0];
  const from = rpcTxn?.transaction?.signerId;
  const to = rpcTxn?.transaction?.receiverId;
  const logs = rpcTxn?.receiptsOutcome?.[0]?.outcome?.logs?.map(
    (log: string) => ({
      logs: log,
      contract: to,
      receiptId: receipt,
    }),
  );

  const actionsLog = rpcTxn?.transaction?.actions?.map(
    (log: RpcTransactionResponse['transaction']['actions'][number]) => {
      const actionInfo = mapRpcActionToAction(log);

      return {
        ...actionInfo,
        args: {
          deposit: actionInfo?.args.deposit,
          gas: actionInfo?.args.gas,
          method_name: actionInfo?.args?.methodName,
          args: displayArgs(actionInfo?.args?.args),
        },
      };
    },
  );

  for (let i = 0; i < transaction.length; i++) {
    const action = mapRpcActionToAction(transaction[i]);

    txActions?.push({
      to,
      from,
      receiptId: receipt,
      logs,
      actionsLog,
      ...action,
    });
  }

  return txActions;
}

export function apiRemainingLogs(
  apiTxn: any,
): Array<{ logs: any; contract: string; receiptId: string }> {
  const remainingReceipts = apiTxn?.receipts?.slice(1) || [];

  const allRemainingLogs: Array<{
    logs: any;
    contract: string;
    receiptId: string;
  }> = [];

  remainingReceipts.forEach((receipt: any) => {
    const receiptLogs =
      receipt?.outcome?.logs?.map((log: string) => ({
        logs: parseEventJson(log),
        contract: receipt?.receiver_account_id || apiTxn?.receiver_account_id,
        receiptId: receipt?.receipt_id,
      })) || [];

    allRemainingLogs.push(...receiptLogs);
  });

  return allRemainingLogs;
}

export function apiTxnActionLogs(txn: ApiTransaction): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receipts || [];

  for (let i = 0; i < outcomes?.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];
    if (logs?.length > 0) {
      const mappedLogs: TransactionLog[] = logs?.map((log: string) => ({
        contract: outcome?.outcome?.executor_account_id || '',
        logs: parseEventJson(log),
        receiptId: outcome?.receipt_id,
      }));
      txLogs = [...txLogs, ...mappedLogs];
    }
  }
  return txLogs;
}

export function processApiActions(
  apiData: ReceiptApiResponse | null,
  allAction: boolean = true,
): ReceiptAction[] {
  const txActions: any = [];
  const receiptTree = apiData?.receipts?.[0];

  function processReceipt(receipt: any, isTopLevel = false) {
    const from = receipt?.predecessor_account_id;
    const to = receipt?.receiver_account_id;
    const receiptId = receipt?.receipt_id;

    if (from === 'system') return;

    const actions = receipt?.actions || [];

    if (!isTopLevel) {
      for (let i = 0; i < actions?.length; i++) {
        const action = actions[i];

        txActions.push({
          from,
          to,
          receiptId,
          action_kind: action?.action_kind,
          args: action?.args,
        });
      }
    }

    const nestedReceipts = receipt?.receipts || [];
    for (let i = 0; i < nestedReceipts?.length; i++) {
      processReceipt(nestedReceipts[i], false);
    }
  }

  if (receiptTree && receiptTree?.receipt_tree) {
    processReceipt(receiptTree?.receipt_tree, allAction);
  }

  return txActions;
}

export function apiMainTxnsActions(apiTxn: ApiTransaction): ActionInfo[] {
  const txActions: ActionInfo[] = [];

  const transaction = apiTxn?.actions || [];
  const firstReceipt = apiTxn?.receipts?.[0];
  const from = apiTxn?.signer_account_id;
  const to = apiTxn?.receiver_account_id;
  const receipt = firstReceipt?.receipt_id;
  const args = apiTxn?.actions_agg;
  const logs =
    firstReceipt?.outcome?.logs?.map((log: string) => ({
      logs: parseEventJson(log),
      contract: to,
      receiptId: receipt,
    })) || [];
  const actionsLog =
    apiTxn?.actions?.map((action: any) => {
      const actionInfo = processApiAction(action);

      return {
        ...actionInfo,
        args: {
          deposit: actionInfo?.args?.deposit || 0,
          gas: actionInfo?.args?.gas || apiTxn?.actions_agg?.gas_attached || 0,
          method_name: actionInfo?.args?.method_name,
          args: actionInfo?.args?.args,
        },
      };
    }) || [];

  for (let i = 0; i < transaction.length; i++) {
    const action = processApiAction(transaction[i], args);
    txActions.push({
      to,
      from,
      receiptId: receipt,
      logs,
      actionsLog,
      ...action,
    });
  }
  return txActions;
}

export const transformReceiptData = (
  apiData: ReceiptApiResponse | null,
): TransformedReceipt | null => {
  if (!apiData || !apiData.receipts || !apiData.receipts.length) {
    return null;
  }

  const transformReceipt = (
    receiptTree: ReceiptTree,
  ): TransformedReceipt | null => {
    if (!receiptTree) return null;
    const outgoingReceipts = receiptTree?.receipts
      ? receiptTree?.receipts
          .map((childReceipt) => transformReceipt(childReceipt))
          .filter((receipt): receipt is TransformedReceipt => receipt !== null)
      : [];

    const actions = receiptTree?.actions?.map((action) => ({
      ...action,
      args: {
        ...action?.args,
        deposit: action?.args?.deposit || '0',
      },
    }));
    const receipt: TransformedReceipt = {
      receipt_id: receiptTree?.receipt_id,
      predecessor_id: receiptTree?.predecessor_account_id,
      receiver_id: receiptTree?.receiver_account_id,
      block_hash: receiptTree?.block?.block_hash,
      block_height: receiptTree?.block?.block_height || null,
      actions: cleanNestedObject(actions),
      outcome: {
        logs: cleanNestedObject(receiptTree?.outcome?.logs) || [],
        status: convertStatus(
          receiptTree?.outcome?.status_key,
          receiptTree?.outcome?.result,
        ),
        gas_burnt: receiptTree?.outcome?.gas_burnt,
        tokens_burnt: receiptTree?.outcome?.tokens_burnt,
        executor_account_id: receiptTree?.outcome?.executor_account_id,
        outgoing_receipts: outgoingReceipts,
      },
      public_key: receiptTree?.public_key,
    };

    return receipt;
  };

  const convertStatus = (status_key: string, result: string) => {
    switch (status_key) {
      case 'SUCCESS_VALUE':
        return { SuccessValue: result || '' };
      case 'SUCCESS_RECEIPT_ID':
        return { SuccessReceiptId: result || '' };
      case 'FAILURE':
        return { Failure: { error_message: result } };
      default:
        return { SuccessValue: result || '' };
    }
  };

  const rootReceipt = apiData?.receipts?.[0].receipt_tree;
  return transformReceipt(rootReceipt);
};

function processApiAction(action: any, args?: any) {
  if (!action) return {};
  return {
    action_kind: action?.action,
    args: {
      method_name: action?.method,
      deposit: args?.deposit || 0,
      gas: args?.gas_attached || 0,
      ...action?.args,
    },
  };
}

async function processTokenMetadata(
  logs: any[],
): Promise<ProcessedTokenMeta[]> {
  const processedTokens: ProcessedTokenMeta[] = [];
  const processedContracts = new Set();

  const fetchTokenMetadata = async (contractId: string, token_id?: string) => {
    if (processedContracts.has(contractId)) return;
    let response;

    try {
      const options: RequestInit = { next: { revalidate: 10 } };
      response = await getRequest(`v1/fts/${contractId}`, {}, options);
      if (token_id) {
        await fetchMultiTokenMetadata(contractId, token_id);
      }

      if (response?.contracts?.[0]) {
        const contract = response.contracts[0];

        processedTokens.push({
          contractId,
          metadata: {
            name: contract.name || '',
            symbol: contract.symbol || '',
            decimals: contract.decimals || 0,
            price: contract.price || '0',
            marketCap: contract.onchain_market_cap || '0',
            volume24h: contract.volume_24h || '0',
            description: contract.description || '',
            website: contract.website || '',
            icon: contract.icon,
          },
        });

        processedContracts.add(contractId);
      }
    } catch (error) {
      console.error(`Error fetching metadata for ${contractId}:`, error);
    }
  };

  const fetchMultiTokenMetadata = async (
    contractId: string,
    tokenId: string,
  ) => {
    const uniqueKey = `${contractId}:${tokenId}`;
    if (processedContracts.has(uniqueKey)) return;

    try {
      const res = await getRequest(`v2/mts/contract/${contractId}/${tokenId}`);
      const tokenData = res?.contracts?.[0];
      const base = tokenData.base;
      const token = tokenData.token;

      processedTokens.push({
        contractId: contractId,
        metadata: {
          name: base.name || '',
          symbol: base.symbol || '',
          decimals: base.decimals || 0,
          price: '0',
          marketCap: '0',
          volume24h: '0',
          description: token.description || '',
          website: '',
          icon: token.media || base.icon || '',
          tokenId: uniqueKey,
        },
      });

      processedContracts.add(uniqueKey);
    } catch (error) {
      console.error(
        `Error fetching multi-token metadata for ${uniqueKey}:`,
        error,
      );
    }
  };

  const processContract = (token: string) => {
    const contractName = token?.includes(':') ? token?.split(':')[1] : token;
    if (contractName) {
      return contractName;
    }
    return null;
  };

  const splitTokenString = (token: string) => {
    const parts = token?.split(':');
    if (parts.length > 1) {
      return {
        standard: parts[0],
        contract: parts[1],
        token_id: parts[2],
      };
    }
    return {
      standard: '',
      contract: '',
      token_id: '',
    };
  };

  for (const log of logs) {
    if (log?.logs?.data && log?.logs?.standard === 'nep245') {
      for (const dataItem of log.logs.data) {
        if (dataItem?.token_ids && Array.isArray(dataItem.token_ids)) {
          for (const token of dataItem.token_ids) {
            const contractName = processContract(token);
            const token_id = splitTokenString(token)?.token_id;
            if (contractName) {
              await fetchTokenMetadata(contractName, token_id);
            }
          }
        }
      }
    } else if (
      (log?.logs?.standard === 'dip4' && log?.logs?.event === 'token_diff') ||
      (log?.logs?.standard === 'nep141' && log?.logs?.event === 'ft_transfer')
    ) {
      if (log?.contract) {
        await fetchTokenMetadata(log.contract);
      }

      if (log?.logs?.data && Array.isArray(log.logs.data)) {
        for (const dataItem of log.logs.data) {
          if (dataItem?.diff) {
            const diffKeys = Object.keys(dataItem.diff);

            if (diffKeys.length === 2) {
              for (const key of diffKeys) {
                const contractName = processContract(key);
                const token_id = splitTokenString(key)?.token_id;
                if (contractName) {
                  await fetchTokenMetadata(contractName, token_id);
                }
              }
            }
          }
        }
      }
    } else if (typeof log?.logs === 'string' && log?.contract) {
      const logString = log?.logs?.match(
        /^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/,
      );
      await fetchTokenMetadata(logString?.[2]);
      await fetchTokenMetadata(logString?.[4].replace(/,$/, ''));
      await fetchTokenMetadata(log.contract);
    }
  }

  return processedTokens;
}

export async function processTransactionWithTokens(
  apiTxn: ApiTransaction,
  receipt: ReceiptApiResponse,
) {
  const apiLogs = apiTxnLogs(apiTxn);
  const apiMainActions = apiMainTxnsActions(apiTxn);
  const apiSubActions = processApiActions(receipt);
  const apiAllActions = processApiActions(receipt, false);
  const apiActionLogs = apiTxnActionLogs(apiTxn);
  const receiptData = transformReceiptData(receipt);
  const tokenMetadata = await processTokenMetadata(apiLogs || []);
  return {
    apiLogs,
    apiActionLogs,
    apiMainActions,
    apiSubActions,
    apiAllActions,
    receiptData,
    tokenMetadata,
  };
}

export function valueFromObj(obj: Obj): string | undefined {
  const keys = obj && Object.keys(obj);

  for (let i = 0; i < keys?.length; i++) {
    const key = keys[i];
    const value = obj[key];

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const nestedValue = valueFromObj(value as Obj);
      if (nestedValue) {
        return nestedValue;
      }
    }
  }

  return undefined;
}

export function txnErrorMessage(txn: TransactionInfo | RpcTransactionResponse) {
  let kind: string | object | undefined;

  if ('outcomes' in txn) {
    kind = txn.outcomes?.result?.ActionError?.kind;
  }

  if ('status' in txn) {
    const status = txn.status;

    if (typeof status === 'object' && 'Failure' in status) {
      const failure = status.Failure;

      if ('ActionError' in failure) {
        kind = failure.ActionError.kind;
      } else {
        kind = failure as object;
      }
    }
  }

  if (typeof kind === 'string') return kind;
  if (kind && typeof kind === 'object') {
    return valueFromObj(kind as Obj);
  }

  return null;
}

export function collectNestedReceiptWithOutcomeOld(
  idOrHash: string,
  parsedMap: Map<string, ParsedReceipt>,
): FailedToFindReceipt | NestedReceiptWithOutcome {
  const parsedElement = parsedMap && parsedMap.get(idOrHash);
  if (!parsedElement) {
    return { id: idOrHash };
  }
  const { receiptIds, ...restOutcome } = parsedElement.outcome;
  return {
    ...parsedElement,
    outcome: {
      ...restOutcome,
      nestedReceipts: receiptIds.map((id: any | ParsedReceipt) =>
        collectNestedReceiptWithOutcomeOld(id, parsedMap),
      ),
    },
  };
}

export function parseReceipt(
  receiptData: any,
  outcome: RpcTransactionResponse['receiptsOutcome'][number],
  transaction: RpcTransactionResponse['transaction'],
) {
  if (!receiptData) {
    return {
      actions:
        transaction.actions && transaction.actions.map(mapRpcActionToAction1),
      id: outcome.id,
      predecessorId: transaction.signerId,
      receiverId: transaction.receiverId,
    };
  }

  const receipt = receiptData;
  return {
    actions:
      'Action' in receipt.receipt
        ? receipt.receipt.Action.actions &&
          receipt.receipt.Action.actions.map(mapRpcActionToAction1)
        : [],
    id: receipt.receiptId,
    predecessorId: receipt.predecessorId,
    receiverId: receipt.receiverId,
  };
}

export function mapNonDelegateRpcActionToAction(
  rpcAction: NonDelegateActionView,
): NonDelegateAction {
  if (rpcAction === 'CreateAccount') {
    return {
      args: {},
      kind: 'createAccount',
    };
  }
  if ('DeployContract' in rpcAction) {
    return {
      args: rpcAction?.DeployContract,
      kind: 'deployContract',
    };
  }
  if ('FunctionCall' in rpcAction) {
    return {
      args: {
        args: rpcAction?.FunctionCall?.args,
        deposit: rpcAction?.FunctionCall?.deposit,
        gas: rpcAction?.FunctionCall?.gas,
        methodName: rpcAction?.FunctionCall?.methodName,
      },
      kind: 'functionCall',
    };
  }
  if ('Transfer' in rpcAction) {
    return {
      args: rpcAction?.Transfer,
      kind: 'transfer',
    };
  }
  if ('Stake' in rpcAction) {
    return {
      args: {
        publicKey: rpcAction?.Stake?.publicKey,
        stake: rpcAction?.Stake?.stake,
      },
      kind: 'stake',
    };
  }
  if ('AddKey' in rpcAction) {
    return {
      args: {
        accessKey: {
          nonce: rpcAction?.AddKey?.accessKey?.nonce,
          permission:
            rpcAction?.AddKey?.accessKey?.permission === 'FullAccess'
              ? {
                  type: 'fullAccess',
                }
              : {
                  contractId:
                    rpcAction?.AddKey?.accessKey?.permission?.FunctionCall
                      ?.receiverId,
                  methodNames:
                    rpcAction?.AddKey?.accessKey?.permission?.FunctionCall
                      ?.methodNames,
                  type: 'functionCall',
                },
        },
        publicKey: rpcAction?.AddKey?.publicKey,
      },
      kind: 'addKey',
    };
  }
  if ('DeleteKey' in rpcAction) {
    return {
      args: {
        publicKey: rpcAction?.DeleteKey?.publicKey,
      },
      kind: 'deleteKey',
    };
  }
  return {
    args: {
      beneficiaryId: rpcAction?.DeleteAccount?.beneficiaryId,
    },
    kind: 'deleteAccount',
  };
}

export function mapRpcInvalidAccessKeyError(error: RPCInvalidAccessKeyError) {
  const UNKNOWN_ERROR = { type: 'unknown' };

  if (error === 'DepositWithFunctionCall') {
    return {
      type: 'depositWithFunctionCall',
    };
  }
  if (error === 'RequiresFullAccess') {
    return {
      type: 'requiresFullAccess',
    };
  }
  if ('AccessKeyNotFound' in error) {
    const { accountId, publicKey } = error?.AccessKeyNotFound;
    return {
      accountId: accountId,
      publicKey: publicKey,
      type: 'accessKeyNotFound',
    };
  }
  if ('ReceiverMismatch' in error) {
    const { akReceiver, txReceiver } = error?.ReceiverMismatch;
    return {
      akReceiver: akReceiver,
      transactionReceiver: txReceiver,
      type: 'receiverMismatch',
    };
  }
  if ('MethodNameMismatch' in error) {
    const { methodName } = error?.MethodNameMismatch;
    return {
      methodName: methodName,
      type: 'methodNameMismatch',
    };
  }
  if ('NotEnoughAllowance' in error) {
    const { accountId, allowance, cost, publicKey } = error.NotEnoughAllowance;
    return {
      accountId: accountId,
      allowance: allowance,
      cost: cost,
      publicKey: publicKey,
      type: 'notEnoughAllowance',
    };
  }

  return UNKNOWN_ERROR;
}

export function mapRpcCompilationError(error: RPCCompilationError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('CodeDoesNotExist' in error) {
    return {
      accountId: error.CodeDoesNotExist?.accountId,
      type: 'codeDoesNotExist',
    };
  }
  if ('PrepareError' in error) {
    return {
      type: 'prepareError',
    };
  }
  if ('WasmerCompileError' in error) {
    return {
      msg: error?.WasmerCompileError?.msg,
      type: 'wasmerCompileError',
    };
  }
  if ('UnsupportedCompiler' in error) {
    return {
      msg: error?.UnsupportedCompiler?.msg,
      type: 'unsupportedCompiler',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcFunctionCallError(error: RPCFunctionCallError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('CompilationError' in error) {
    return {
      error: mapRpcCompilationError(error?.CompilationError),
      type: 'compilationError',
    };
  }
  if ('LinkError' in error) {
    return {
      msg: error?.LinkError?.msg,
      type: 'linkError',
    };
  }
  if ('MethodResolveError' in error) {
    return {
      type: 'methodResolveError',
    };
  }
  if ('WasmTrap' in error) {
    return {
      type: 'wasmTrap',
    };
  }
  if ('WasmUnknownError' in error) {
    return {
      type: 'wasmUnknownError',
    };
  }
  if ('HostError' in error) {
    return {
      type: 'hostError',
    };
  }
  if ('_EVMError' in error) {
    return {
      type: 'evmError',
    };
  }
  if ('ExecutionError' in error) {
    return {
      error: error?.ExecutionError,
      type: 'executionError',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcNewReceiptValidationError(
  error: RPCNewReceiptValidationError,
) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('InvalidPredecessorId' in error) {
    return {
      accountId: error?.InvalidPredecessorId?.accountId,
      type: 'invalidPredecessorId',
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      accountId: error?.InvalidReceiverId?.accountId,
      type: 'invalidReceiverId',
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      accountId: error?.InvalidSignerId?.accountId,
      type: 'invalidSignerId',
    };
  }
  if ('InvalidDataReceiverId' in error) {
    return {
      accountId: error?.InvalidDataReceiverId?.accountId,
      type: 'invalidDataReceiverId',
    };
  }
  if ('ReturnedValueLengthExceeded' in error) {
    return {
      length: error?.ReturnedValueLengthExceeded?.length,
      limit: error?.ReturnedValueLengthExceeded?.limit,
      type: 'returnedValueLengthExceeded',
    };
  }
  if ('NumberInputDataDependenciesExceeded' in error) {
    return {
      limit: error?.NumberInputDataDependenciesExceeded?.limit,
      numberOfInputDataDependencies:
        error?.NumberInputDataDependenciesExceeded
          ?.numberOfInputDataDependencies,
      type: 'numberInputDataDependenciesExceeded',
    };
  }
  if ('ActionsValidation' in error) {
    return {
      type: 'actionsValidation',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptActionError(error: ActionError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  const { kind } = error;
  if (kind === 'DelegateActionExpired') {
    return {
      type: 'delegateActionExpired',
    };
  }
  if (kind === 'DelegateActionInvalidSignature') {
    return {
      type: 'delegateActionInvalidSignature',
    };
  }
  if ('DelegateActionSenderDoesNotMatchTxReceiver' in kind) {
    return {
      receiverId: kind?.DelegateActionSenderDoesNotMatchTxReceiver?.receiverId,
      senderId: kind?.DelegateActionSenderDoesNotMatchTxReceiver?.senderId,
      type: 'delegateActionSenderDoesNotMatchTxReceiver',
    };
  }
  if ('DelegateActionAccessKeyError' in kind) {
    return {
      error: mapRpcInvalidAccessKeyError(kind?.DelegateActionAccessKeyError),
      type: 'delegateActionAccessKeyError',
    };
  }
  if ('DelegateActionInvalidNonce' in kind) {
    return {
      akNonce: kind?.DelegateActionInvalidNonce?.akNonce,
      delegateNonce: kind?.DelegateActionInvalidNonce?.delegateNonce,
      type: 'delegateActionInvalidNonce',
    };
  }
  if ('DelegateActionNonceTooLarge' in kind) {
    return {
      delegateNonce: kind?.DelegateActionNonceTooLarge?.delegateNonce,
      type: 'delegateActionNonceTooLarge',
      upperBound: kind?.DelegateActionNonceTooLarge?.upperBound,
    };
  }
  if ('AccountAlreadyExists' in kind) {
    return {
      accountId: kind?.AccountAlreadyExists?.accountId,
      type: 'accountAlreadyExists',
    };
  }
  if ('AccountDoesNotExist' in kind) {
    return {
      accountId: kind?.AccountDoesNotExist?.accountId,
      type: 'accountDoesNotExist',
    };
  }
  if ('CreateAccountOnlyByRegistrar' in kind) {
    return {
      accountId: kind?.CreateAccountOnlyByRegistrar?.accountId,
      predecessorId: kind?.CreateAccountOnlyByRegistrar?.predecessorId,
      registrarAccountId:
        kind?.CreateAccountOnlyByRegistrar?.registrarAccountId,
      type: 'createAccountOnlyByRegistrar',
    };
  }
  if ('CreateAccountNotAllowed' in kind) {
    return {
      accountId: kind?.CreateAccountNotAllowed?.accountId,
      predecessorId: kind?.CreateAccountNotAllowed?.predecessorId,
      type: 'createAccountNotAllowed',
    };
  }
  if ('ActorNoPermission' in kind) {
    return {
      accountId: kind?.ActorNoPermission?.accountId,
      actorId: kind?.ActorNoPermission?.actorId,
      type: 'actorNoPermission',
    };
  }
  if ('DeleteKeyDoesNotExist' in kind) {
    return {
      accountId: kind?.DeleteKeyDoesNotExist?.accountId,
      publicKey: kind?.DeleteKeyDoesNotExist?.publicKey,
      type: 'deleteKeyDoesNotExist',
    };
  }
  if ('AddKeyAlreadyExists' in kind) {
    return {
      accountId: kind?.AddKeyAlreadyExists?.accountId,
      publicKey: kind?.AddKeyAlreadyExists?.publicKey,
      type: 'addKeyAlreadyExists',
    };
  }
  if ('DeleteAccountStaking' in kind) {
    return {
      accountId: kind?.DeleteAccountStaking?.accountId,
      type: 'deleteAccountStaking',
    };
  }
  if ('LackBalanceForState' in kind) {
    return {
      accountId: kind?.LackBalanceForState?.accountId,
      amount: kind?.LackBalanceForState?.amount,
      type: 'lackBalanceForState',
    };
  }
  if ('TriesToUnstake' in kind) {
    return {
      accountId: kind?.TriesToUnstake?.accountId,
      type: 'triesToUnstake',
    };
  }
  if ('TriesToStake' in kind) {
    return {
      accountId: kind?.TriesToStake?.accountId,
      balance: kind?.TriesToStake?.balance,
      locked: kind?.TriesToStake?.locked,
      stake: kind?.TriesToStake?.stake,
      type: 'triesToStake',
    };
  }
  if ('InsufficientStake' in kind) {
    return {
      accountId: kind?.InsufficientStake?.accountId,
      minimumStake: kind?.InsufficientStake?.minimumStake,
      stake: kind?.InsufficientStake?.stake,
      type: 'insufficientStake',
    };
  }
  if ('FunctionCallError' in kind) {
    return {
      error: mapRpcFunctionCallError(kind?.FunctionCallError),
      type: 'functionCallError',
    };
  }
  if ('NewReceiptValidationError' in kind) {
    return {
      error: mapRpcNewReceiptValidationError(kind?.NewReceiptValidationError),
      type: 'newReceiptValidationError',
    };
  }
  if ('OnlyImplicitAccountCreationAllowed' in kind) {
    return {
      accountId: kind?.OnlyImplicitAccountCreationAllowed?.accountId,
      type: 'onlyImplicitAccountCreationAllowed',
    };
  }
  if ('DeleteAccountWithLargeState' in kind) {
    return {
      accountId: kind?.DeleteAccountWithLargeState?.accountId,
      type: 'deleteAccountWithLargeState',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptInvalidTxError(error: InvalidTxError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('InvalidAccessKeyError' in error) {
    return {
      error: mapRpcInvalidAccessKeyError(error?.InvalidAccessKeyError),
      type: 'invalidAccessKeyError',
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      signerId: error?.InvalidSignerId?.signerId,
      type: 'invalidSignerId',
    };
  }
  if ('SignerDoesNotExist' in error) {
    return {
      signerId: error?.SignerDoesNotExist?.signerId,
      type: 'signerDoesNotExist',
    };
  }
  if ('InvalidNonce' in error) {
    return {
      akNonce: error?.InvalidNonce?.akNonce,
      transactionNonce: error?.InvalidNonce?.txNonce,
      type: 'invalidNonce',
    };
  }
  if ('NonceTooLarge' in error) {
    return {
      transactionNonce: error?.NonceTooLarge?.txNonce,
      type: 'nonceTooLarge',
      upperBound: error?.NonceTooLarge?.upperBound,
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      receiverId: error?.InvalidReceiverId?.receiverId,
      type: 'invalidReceiverId',
    };
  }
  if ('InvalidSignature' in error) {
    return {
      type: 'invalidSignature',
    };
  }
  if ('NotEnoughBalance' in error) {
    return {
      balance: error?.NotEnoughBalance?.balance,
      cost: error?.NotEnoughBalance?.cost,
      signerId: error?.NotEnoughBalance?.signerId,
      type: 'notEnoughBalance',
    };
  }
  if ('LackBalanceForState' in error) {
    return {
      amount: error?.LackBalanceForState?.amount,
      signerId: error?.LackBalanceForState?.signerId,
      type: 'lackBalanceForState',
    };
  }
  if ('CostOverflow' in error) {
    return {
      type: 'costOverflow',
    };
  }
  if ('InvalidChain' in error) {
    return {
      type: 'invalidChain',
    };
  }
  if ('Expired' in error) {
    return {
      type: 'expired',
    };
  }
  if ('ActionsValidation' in error) {
    return {
      type: 'actionsValidation',
    };
  }
  if ('TransactionSizeExceeded' in error) {
    return {
      limit: error?.TransactionSizeExceeded?.limit,
      size: error?.TransactionSizeExceeded?.size,
      type: 'transactionSizeExceeded',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptError(error: TxExecutionError) {
  let UNKNOWN_ERROR = { type: 'unknown' };
  if ('ActionError' in error) {
    return {
      error: mapRpcReceiptActionError(error?.ActionError),
      type: 'action',
    };
  }
  if ('InvalidTxError' in error) {
    return {
      error: mapRpcReceiptInvalidTxError(error?.InvalidTxError),
      type: 'transaction',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptStatus(status: any) {
  if ('SuccessValue' in status) {
    return { type: 'successValue', value: status?.SuccessValue };
  }
  if ('SuccessReceiptId' in status) {
    return { receiptId: status?.SuccessReceiptId, type: 'successReceiptId' };
  }
  if ('Failure' in status) {
    return { error: mapRpcReceiptError(status?.Failure), type: 'failure' };
  }
  return { type: 'unknown' };
}

export function mapRpcActionToAction1(rpcAction: NonDelegateActionView) {
  if (rpcAction?.action_kind) {
    const normalizedAction = {
      [rpcAction?.action_kind]: {
        ...rpcAction.args,
      },
    };

    return mapNonDelegateRpcActionToAction(normalizedAction);
  }

  if (typeof rpcAction === 'object' && 'Delegate' in rpcAction) {
    return {
      args: {
        actions: rpcAction?.Delegate?.delegateAction?.actions?.map(
          (subaction: NonDelegateActionView, index: number) => ({
            ...mapNonDelegateRpcActionToAction(subaction),
            delegateIndex: index,
          }),
        ),
        receiverId: rpcAction?.Delegate?.delegateAction?.receiverId,
        senderId: rpcAction?.Delegate?.delegateAction?.senderId,
      },
      kind: 'delegateAction',
    };
  }
  return mapNonDelegateRpcActionToAction(rpcAction);
}

export function parseOutcomeOld(
  outcome: RpcTransactionResponse['receiptsOutcome'][number],
) {
  return {
    blockHash: outcome?.blockHash,
    gasBurnt: outcome?.outcome?.gasBurnt,
    logs: outcome?.outcome?.logs,
    receiptIds: outcome?.outcome?.receiptIds,
    status: mapRpcReceiptStatus(outcome?.outcome?.status),
    tokensBurnt: outcome?.outcome?.tokensBurnt,
  };
}

export const calculateGasUsed = (
  receiptsOutcome: RpcTransactionResponse['receiptsOutcome'],
  txnTokensBurnt: string,
) => {
  return receiptsOutcome
    ?.map((receipt) => receipt?.outcome?.gasBurnt)
    ?.reduce((acc, fee) => Big(acc)?.add(fee)?.toString(), txnTokensBurnt);
};
export function calculateTotalGas(actions: Action | any) {
  let totalGas = 0;

  function extractGas(action: any) {
    const actionType = Object.keys(action)[0];

    if (
      actionType === 'Delegate' &&
      action[actionType]?.delegate_action?.actions
    ) {
      action[actionType]?.delegate_action?.actions.forEach(
        (nestedAction: Action) => {
          extractGas(nestedAction);
        },
      );
    } else if (action[actionType] && action[actionType].gas) {
      totalGas += Number(action[actionType].gas);
    }
  }

  actions.forEach((action: Action) => {
    extractGas(action);
  });

  return totalGas;
}
export function calculateTotalDeposit(actions: Action | any) {
  let totalDeposit = 0;

  function extractDeposit(action: any) {
    const actionType = Object.keys(action)[0];

    if (
      actionType === 'Delegate' &&
      action[actionType]?.delegate_action?.actions
    ) {
      action[actionType]?.delegate_action?.actions?.forEach(
        (nestedAction: Action) => {
          extractDeposit(nestedAction);
        },
      );
    } else if (action[actionType] && action[actionType]?.deposit) {
      totalDeposit += Number(action[actionType]?.deposit);
    }
  }

  actions.forEach((action: Action) => {
    extractDeposit(action);
  });

  return totalDeposit;
}
export const txnFee = (
  receiptsOutcome: RpcTransactionResponse['receiptsOutcome'],
  txnTokensBurnt: string,
) => {
  return receiptsOutcome
    .map((receipt) => receipt?.outcome?.tokensBurnt)
    ?.reduce((acc, fee) => Big(acc)?.add(fee)?.toString(), txnTokensBurnt);
};

export function parseEventLogs(event: TransactionLog): {} | any {
  let parsedEvent: {} | any = {};

  try {
    if (event?.logs?.startsWith('EVENT_JSON:')) {
      parsedEvent = JSON.parse(event?.logs?.replace('EVENT_JSON:', ''));
    }
  } catch (error) {
    console.error('Failed to parse event logs:', error);
  }

  return parsedEvent;
}

export const networkFullNames: any = supportedNetworks;

export function getNetworkDetails(input: string): string {
  const matchedKey = Object.keys(intentsAddressList).find(
    (key) => intentsAddressList[key] === input,
  );

  if (!matchedKey) {
    return '';
  }

  const network = matchedKey.includes('-')
    ? matchedKey.split('-')[0]
    : matchedKey;

  if (isExplorerNetwork(network)) {
    return networkFullNames[network];
  }

  return '';
}

function isExplorerNetwork(value: string): value is NetworkType {
  return Object.keys(networkFullNames).includes(value);
}

export function convertNumericStringsToNumbers(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertNumericStringsToNumbers);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertNumericStringsToNumbers(value),
      ]),
    );
  }

  if (typeof obj === 'string') {
    if (/^\d+$/.test(obj)) {
      const num = Number(obj);
      return Number.isSafeInteger(num) ? num : obj;
    }
  }

  return obj;
}
