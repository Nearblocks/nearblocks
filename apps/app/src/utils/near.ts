import Big from 'big.js';

import {
  Action,
  ActionError,
  ActionInfo,
  ActionType,
  ApiTransaction,
  ExecutionOutcomeWithIdView,
  ExecutionStatusView,
  FailedToFindReceipt,
  InvalidTxError,
  NestedReceiptWithOutcome,
  NetworkType,
  NonDelegateAction,
  NonDelegateActionView,
  Obj,
  OutcomeInfo,
  ParsedReceipt,
  ParseOutcomeInfo,
  ProcessedTokenMeta,
  ReceiptsInfo,
  ReceiptView,
  RPCCompilationError,
  RPCFunctionCallError,
  RPCInvalidAccessKeyError,
  RPCNewReceiptValidationError,
  RPCTransactionInfo,
  TransactionLog,
  TxExecutionError,
} from '@/utils/types';
import { intentsAddressList, supportedNetworks } from './app/config';
import { isValidJson, parseEventJson } from './libs';
import { getRequest } from './app/api';

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

export function txnLogs(txn: RPCTransactionInfo): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receipts_outcome || [];

  for (let i = 1; i < outcomes?.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs?.length > 0) {
      const mappedLogs: TransactionLog[] = logs?.map((log: string) => ({
        contract: outcome?.outcome?.executor_id || '',
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

  for (let i = 1; i < outcomes?.length; i++) {
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

export function txnActionLogs(txn: RPCTransactionInfo): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receipts_outcome || [];

  for (let i = 0; i < outcomes?.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs.length > 0) {
      const mappedLogs: TransactionLog[] = logs?.map((log: string) => ({
        contract: outcome?.outcome?.executor_id || '',
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

export function txnActions(txn: RPCTransactionInfo) {
  const txActions = [];
  const receipts = txn?.receipts || [];

  for (let i = 1; i < receipts?.length; i++) {
    const receipt = receipts[i];
    const from = receipt?.predecessor_id;
    const to = receipt?.receiver_id;
    const receiptId = receipt?.receipt_id;

    if (from === 'system') continue;

    if (Array.isArray(receipt?.receipt)) {
      const actions = receipt?.receipt;

      for (let j = 0; j < actions?.length; j++) {
        const action = actions[j];

        txActions?.push({ from, to, receiptId, ...action });
      }
    } else {
      const actions = receipt?.receipt?.Action?.actions || [];

      for (let j = 0; j < actions?.length; j++) {
        const action = mapRpcActionToAction(actions[j]);

        txActions.push({ from, to, receiptId, ...action });
      }
    }
  }

  return txActions;
}

export function txnAllActions(txn: RPCTransactionInfo) {
  const txActions = [];
  const receipts = txn?.receipts || [];

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    const from = receipt?.predecessor_id;
    const to = receipt?.receiver_id;
    const receiptId = receipt?.receipt_id;

    if (from === 'system') continue;

    if (Array.isArray(receipt?.receipt)) {
      const actions = receipt.receipt;

      for (let j = 0; j < actions.length; j++) {
        const action = actions[j];

        txActions.push({ from, to, receiptId, ...action });
      }
    } else {
      const actions = receipt?.receipt?.Action?.actions || [];

      for (let j = 0; j < actions.length; j++) {
        const action = mapRpcActionToAction(actions[j]);

        txActions.push({ from, to, receiptId, ...action });
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

export function mainActions(rpcTxn: any) {
  const txActions = [];
  const transaction = rpcTxn?.transaction?.actions || [];
  const receipt = rpcTxn?.transaction_outcome?.outcome?.receipt_ids?.[0];
  const from = rpcTxn?.transaction?.signer_id;
  const to = rpcTxn?.transaction?.receiver_id;
  const logs = rpcTxn?.receipts_outcome?.[0]?.outcome?.logs?.map(
    (log: any) => ({
      logs: log,
      contract: to,
      receiptId: receipt,
    }),
  );

  const actionsLog = rpcTxn?.transaction?.actions?.map((log: any) => {
    const actionInfo: any = mapRpcActionToAction(log);

    return {
      ...actionInfo,
      args: {
        deposit: actionInfo?.args.deposit,
        gas: actionInfo?.args.gas,
        method_name: actionInfo?.args?.method_name,
        args: displayArgs(actionInfo?.args?.args),
      },
    };
  });

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

export function apiSubActions(apiTxn: ApiTransaction): ActionInfo[] {
  const txActions: ActionInfo[] = [];
  const transaction = apiTxn?.actions || [];
  const from = apiTxn?.signer_account_id;
  const to = apiTxn?.receiver_account_id;
  const receipt = apiTxn?.receipts?.[0]?.receipt_id;

  const remainingLogs = apiRemainingLogs(apiTxn);

  const allLogs = [...remainingLogs];

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
    const action = processApiAction(transaction[i]);
    txActions.push({
      to,
      from,
      receiptId: receipt,
      logs: allLogs,
      actionsLog,
      ...action,
    });
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

function createTransactionReceipts(apiResponse: ApiTransaction) {
  // Extract the first transaction from the response

  // Create a map for receipts and their outcomes
  const receiptsMap = new Map();
  const receiptsOutcomeMap = new Map();

  // Process receipts to build the internal data structures
  apiResponse.receipts.forEach((receipt) => {
    const receiptId = receipt.receipt_id;

    // Create receipt entry
    receiptsMap.set(receiptId, {
      predecessor_id: receipt.predecessor_account_id,
      priority: 0, // Default priority
      receipt: {},
      receipt_id: receiptId,
      receiver_id: receipt.receiver_account_id,
    });

    // Create receipt outcome entry
    receiptsOutcomeMap.set(receiptId, {
      block_hash: receipt.block.block_hash,
      id: receiptId,
      outcome: {
        executor_id: receipt?.outcome?.executor_account_id,
        gas_burnt: receipt?.outcome?.gas_burnt,
        logs: receipt?.outcome?.logs,
        status: receipt?.outcome?.status ? 'SuccessValue' : 'Failure',
        tokens_burnt: receipt?.outcome?.tokens_burnt,
      },
      proof: [],
    });
  });

  // Map actions to the format needed
  const actions = apiResponse.actions.map((action) => {
    return {
      args: action.args_full?.args_json || {},
      deposit: action.args_full?.deposit || '0',
      gas: action.args_full?.gas || 0,
      method_name: action.args_full?.method_name || action.method,
    };
  });

  // Construct the transaction data structure
  const txnData = {
    TXN_STRING: {
      final_execution_status: 'FINAL',
      receipts: Array.from(receiptsMap.values()),
      receipts_outcome: Array.from(receiptsOutcomeMap.values()),
      status: {
        successValue: apiResponse.outcomes.status ? '' : null,
      },
      transaction: {
        actions: actions,
        hash: apiResponse.transaction_hash,
        nonce: parseInt(apiResponse.block_timestamp) || 0,
        priority_fee: 0,
        public_key:
          apiResponse.actions[0]?.args_full?.args_json?.signed?.[0]
            ?.public_key || '',
        receiver_id: apiResponse.receiver_account_id,
        signature:
          apiResponse.actions[0]?.args_full?.args_json?.signed?.[0]
            ?.signature || '',
        signer_id: apiResponse.signer_account_id,
      },
    },
  };

  // Use the collectReceipts logic from the original function
  const collectReceipts = (receiptHash) => {
    const receipt = receiptsMap.get(receiptHash);
    const receiptOutcome = receiptsOutcomeMap.get(receiptHash);

    if (!receipt || !receiptOutcome) {
      return null;
    }

    // Find outgoing receipts by checking which receipts have this receipt as predecessor
    const outgoingReceiptIds = [];
    receiptsMap?.forEach((r, id) => {
      if (r.predecessor_id === receipt.receiver_id) {
        outgoingReceiptIds.push(id);
      }
    });

    return {
      ...receipt,
      ...receiptOutcome,
      outcome: {
        ...receiptOutcome.outcome,
        outgoing_receipts: outgoingReceiptIds
          .map(collectReceipts)
          .filter(Boolean),
      },
    };
  };

  // Find the first receipt_id (usually from the main transaction)
  const firstReceiptId = apiResponse?.receipts[0]?.receipt_id;

  return firstReceiptId ? collectReceipts(firstReceiptId) : null;
}

function transactionReceiptsFromApi(txn: any) {
  // Assuming the first transaction in the txns array

  console.log({ API_TXN_STRING: txn });

  // Map actions from the API transaction
  const actions: any[] = txn.actions?.map(mapApiActionToActions) || [];

  // Create receipt maps for efficient lookup
  const receiptOutcomesByIdMap = new Map();
  const receiptsByIdMap = new Map();

  // Populate receipt outcomes map
  txn.receipts?.forEach((receiptItem) => {
    receiptsByIdMap.set(receiptItem.receipt_id, {
      ...receiptItem,
      actions: receiptItem.receipt_kind === 'ACTION' ? actions : [],
    });

    // Include outcome if available
    if (receiptItem.outcome) {
      receiptOutcomesByIdMap.set(receiptItem.receipt_id, receiptItem.outcome);
    }
  });

  // Recursive function to collect receipt details
  const collectReceipts = (receiptId: string) => {
    const receipt = receiptsByIdMap.get(receiptId);
    const receiptOutcome = receiptOutcomesByIdMap.get(receiptId);

    return {
      ...receipt,
      outcome: {
        ...receiptOutcome,
        // You might want to add additional processing for outgoing receipts if needed
        outgoing_receipts: [],
      },
    };
  };

  // Return the processed receipt (using the first receipt)
  return collectReceipts(txn.receipts?.[0]?.receipt_id);
}

// Helper function to map API actions to a consistent format
function mapApiActionToActions(action: any) {
  return {
    action_kind: action.action,
    method_name: action.method,
    args: action.args_full?.args_json || action.args,
    gas: action.args_full?.gas,
    deposit: action.args_full?.deposit,
  };
}

function apiTransactionReceipts(transaction: ApiTransaction) {
  // Extract the transaction from the API response

  if (!transaction) return null;
  console.log({ transaction });
  const receiptOutcomesByIdMap = new Map();
  const receiptsByIdMap = new Map();

  // Process all receipts from the API response
  transaction.receipts?.forEach((receipt) => {
    // Map receipt to the structure expected in the result
    receiptsByIdMap.set(receipt.receipt_id, {
      predecessor_id: receipt.predecessor_account_id,
      receipt_id: receipt.receipt_id,
      receiver_id: receipt.receiver_account_id,
      actions:
        receipt.receipt_kind === 'ACTION' &&
        receipt.receipt_id === transaction.receipts[0].receipt_id
          ? transaction.actions?.map((action) => mapApiActionToAction(action))
          : [],
    });

    // Map receipt outcome to the structure expected in the result
    receiptOutcomesByIdMap.set(receipt.receipt_id, {
      id: receipt.receipt_id,
      block_hash: receipt.block?.block_hash,
      outcome: {
        executor_id: receipt.outcome?.executor_account_id,
        gas_burnt: receipt.outcome?.gas_burnt,
        logs: receipt.outcome?.logs || [],
        receipt_ids: getOutgoingReceiptIds(
          receipt.receipt_id,
          transaction.receipts,
        ),
        status: receipt.outcome?.status
          ? { SuccessValue: '' }
          : { Failure: receipt.outcome?.status },
        tokens_burnt: receipt.outcome?.tokens_burnt?.toString(),
      },
    });
  });

  // Add the main transaction to the receipts map if it doesn't exist
  if (!receiptsByIdMap.has(transaction.receipts[0].receipt_id)) {
    receiptsByIdMap.set(transaction.receipts[0].receipt_id, {
      predecessor_id: transaction.signer_account_id,
      receipt_id: transaction.receipts[0].receipt_id,
      receiver_id: transaction.receiver_account_id,
      actions: transaction.actions?.map((action) =>
        mapApiActionToAction(action),
      ),
    });
  }

  // Helper function to determine which receipt IDs are outgoing from a given receipt
  function getOutgoingReceiptIds(
    currentReceiptId: string,
    allReceipts: any[],
  ): string[] {
    // In a real implementation, you would need to know the dependency chain
    // For now, we'll use a simple heuristic based on the order of receipts in the array
    const currentIndex = allReceipts.findIndex(
      (r) => r.receipt_id === currentReceiptId,
    );
    if (currentIndex === allReceipts.length - 1) return []; // Last receipt has no outgoing receipts

    return [allReceipts[currentIndex + 1].receipt_id];
  }

  // Recursive function to collect receipts, similar to the original implementation
  const collectReceipts = (receiptHash: string) => {
    const receipt = receiptsByIdMap.get(receiptHash);
    const receiptOutcome = receiptOutcomesByIdMap.get(receiptHash);

    if (!receipt || !receiptOutcome) return null;

    return {
      ...receipt,
      ...receiptOutcome,
      outcome: {
        ...receiptOutcome.outcome,
        outgoing_receipts:
          receiptOutcome.outcome.receipt_ids
            ?.map(collectReceipts)
            .filter(Boolean) || [],
      },
    };
  };

  // Start with the first receipt in the transaction
  return collectReceipts(transaction.receipts[0].receipt_id);
}

// Helper function to map API action to the format expected by the existing code
function mapApiActionToAction(action: any) {
  if (!action) return null;

  return {
    action_kind: action.action || action.action_kind,
    args: action.args_full || {
      method_name: action.method,
      args: action.args,
      gas: action.actions_agg?.gas_attached,
      deposit: action.actions_agg?.deposit,
    },
  };
}

function processApiAction(action: any, args?: any) {
  if (!action) return {};
  return {
    action_kind: action.action,
    args: {
      method_name: action.method,
      args: action.args,
      deposit: args?.deposit || 0,
      gas: args?.gas_attached || 0,
      ...action?.args_full,
    },
  };
}

async function processTokenMetadata(
  logs: any[],
): Promise<ProcessedTokenMeta[]> {
  const processedTokens: ProcessedTokenMeta[] = [];
  const processedContracts = new Set();

  const fetchTokenMetadata = async (contractId: string) => {
    if (processedContracts.has(contractId)) return;

    try {
      const options: RequestInit = { next: { revalidate: 10 } };
      const response = await getRequest(`v1/fts/${contractId}`, {}, options);

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

  const processContract = (token: string) => {
    const contractName = token?.includes(':') ? token?.split(':')[1] : token;
    if (contractName) {
      return contractName;
    }
    return null;
  };

  for (const log of logs) {
    if (log?.logs?.data && log?.logs?.standard === 'nep245') {
      for (const dataItem of log.logs.data) {
        if (dataItem?.token_ids && Array.isArray(dataItem.token_ids)) {
          for (const token of dataItem.token_ids) {
            const contractName = processContract(token);
            if (contractName) {
              await fetchTokenMetadata(contractName);
            }
          }
        }
      }
    } else if (
      log?.logs?.standard === 'dip4' &&
      log?.logs?.event === 'token_diff'
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
                if (contractName) {
                  await fetchTokenMetadata(contractName);
                }
              }
            }
          }
        }
      }
    } else if (typeof log?.logs === 'string' && log?.contract) {
      await fetchTokenMetadata(log.contract);
    }
  }

  return processedTokens;
}

export async function processTransactionWithTokens(apiTxn: ApiTransaction) {
  const logs = apiTxnLogs(apiTxn);
  const apiActions = apiMainTxnsActions(apiTxn);
  const subActions = apiSubActions(apiTxn);
  const apiActionLogs = apiTxnActionLogs(apiTxn);
  const receiptData = apiTransactionReceipts(apiTxn);
  const receiptData2 = transactionReceiptsFromApi(apiTxn);
  console.log({ receiptData2 });
  console.log({ receiptData });
  const allLogs = (
    apiActions && apiActions?.[0] && apiActions?.[0]?.logs
      ? apiActions?.[0]?.logs
      : []
  ).concat(
    subActions && subActions?.[0] && subActions?.[0]?.logs
      ? subActions?.[0]?.logs
      : [],
  );

  const tokenMetadata = await processTokenMetadata(allLogs || []);

  return {
    logs,
    apiActionLogs,
    apiActions,
    subActions,
    receiptData,
    receiptData2,
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

export function txnErrorMessage(txn: RPCTransactionInfo) {
  const kind = txn?.status?.Failure?.ActionError?.kind;

  if (typeof kind === 'string') return kind;
  if (typeof kind === 'object') {
    return valueFromObj(kind);
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
  receipt: ReceiptsInfo | ReceiptView | undefined,
  outcome: OutcomeInfo,
  transaction: NonDelegateActionView,
) {
  if (!receipt) {
    return {
      actions: transaction?.actions?.map(mapRpcActionToAction1),
      id: outcome?.id,
      predecessorId: transaction?.signer_id,
      receiverId: transaction?.receiver_id,
    };
  }

  let actions: any = [];

  if ('Action' in receipt?.receipt) {
    actions = receipt?.receipt?.Action?.actions?.map(mapRpcActionToAction1);
  } else if (Array.isArray(receipt?.receipt)) {
    actions = receipt?.receipt?.map((action) => mapRpcActionToAction1(action));
  }
  return {
    actions: actions,
    id: receipt?.receipt_id,
    predecessorId: receipt?.predecessor_id,
    receiverId: receipt?.receiver_id,
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
        methodName: rpcAction?.FunctionCall?.method_name,
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
        publicKey: rpcAction?.Stake?.public_key,
        stake: rpcAction?.Stake?.stake,
      },
      kind: 'stake',
    };
  }
  if ('AddKey' in rpcAction) {
    return {
      args: {
        accessKey: {
          nonce: rpcAction?.AddKey?.access_key?.nonce,
          permission:
            rpcAction?.AddKey?.access_key?.permission === 'FullAccess'
              ? {
                  type: 'fullAccess',
                }
              : {
                  contractId:
                    rpcAction?.AddKey?.access_key?.permission?.FunctionCall
                      ?.receiver_id,
                  methodNames:
                    rpcAction?.AddKey?.access_key?.permission?.FunctionCall
                      ?.method_names,
                  type: 'functionCall',
                },
        },
        publicKey: rpcAction?.AddKey?.public_key,
      },
      kind: 'addKey',
    };
  }
  if ('DeleteKey' in rpcAction) {
    return {
      args: {
        publicKey: rpcAction?.DeleteKey?.public_key,
      },
      kind: 'deleteKey',
    };
  }
  return {
    args: {
      beneficiaryId: rpcAction?.DeleteAccount?.beneficiary_id,
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
    const { account_id, public_key } = error?.AccessKeyNotFound;
    return {
      accountId: account_id,
      publicKey: public_key,
      type: 'accessKeyNotFound',
    };
  }
  if ('ReceiverMismatch' in error) {
    const { ak_receiver, tx_receiver } = error?.ReceiverMismatch;
    return {
      akReceiver: ak_receiver,
      transactionReceiver: tx_receiver,
      type: 'receiverMismatch',
    };
  }
  if ('MethodNameMismatch' in error) {
    const { method_name } = error?.MethodNameMismatch;
    return {
      methodName: method_name,
      type: 'methodNameMismatch',
    };
  }
  if ('NotEnoughAllowance' in error) {
    const { account_id, allowance, cost, public_key } =
      error.NotEnoughAllowance;
    return {
      accountId: account_id,
      allowance: allowance,
      cost: cost,
      publicKey: public_key,
      type: 'notEnoughAllowance',
    };
  }

  return UNKNOWN_ERROR;
}

export function mapRpcCompilationError(error: RPCCompilationError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('CodeDoesNotExist' in error) {
    return {
      accountId: error.CodeDoesNotExist?.account_id,
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
      accountId: error?.InvalidPredecessorId?.account_id,
      type: 'invalidPredecessorId',
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      accountId: error?.InvalidReceiverId?.account_id,
      type: 'invalidReceiverId',
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      accountId: error?.InvalidSignerId?.account_id,
      type: 'invalidSignerId',
    };
  }
  if ('InvalidDataReceiverId' in error) {
    return {
      accountId: error?.InvalidDataReceiverId?.account_id,
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
          ?.number_of_input_data_dependencies,
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
      receiverId: kind?.DelegateActionSenderDoesNotMatchTxReceiver?.receiver_id,
      senderId: kind?.DelegateActionSenderDoesNotMatchTxReceiver?.sender_id,
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
      akNonce: kind?.DelegateActionInvalidNonce?.ak_nonce,
      delegateNonce: kind?.DelegateActionInvalidNonce?.delegate_nonce,
      type: 'delegateActionInvalidNonce',
    };
  }
  if ('DelegateActionNonceTooLarge' in kind) {
    return {
      delegateNonce: kind?.DelegateActionNonceTooLarge?.delegate_nonce,
      type: 'delegateActionNonceTooLarge',
      upperBound: kind?.DelegateActionNonceTooLarge?.upper_bound,
    };
  }
  if ('AccountAlreadyExists' in kind) {
    return {
      accountId: kind?.AccountAlreadyExists?.account_id,
      type: 'accountAlreadyExists',
    };
  }
  if ('AccountDoesNotExist' in kind) {
    return {
      accountId: kind?.AccountDoesNotExist?.account_id,
      type: 'accountDoesNotExist',
    };
  }
  if ('CreateAccountOnlyByRegistrar' in kind) {
    return {
      accountId: kind?.CreateAccountOnlyByRegistrar?.account_id,
      predecessorId: kind?.CreateAccountOnlyByRegistrar?.predecessor_id,
      registrarAccountId:
        kind?.CreateAccountOnlyByRegistrar?.registrar_account_id,
      type: 'createAccountOnlyByRegistrar',
    };
  }
  if ('CreateAccountNotAllowed' in kind) {
    return {
      accountId: kind?.CreateAccountNotAllowed?.account_id,
      predecessorId: kind?.CreateAccountNotAllowed?.predecessor_id,
      type: 'createAccountNotAllowed',
    };
  }
  if ('ActorNoPermission' in kind) {
    return {
      accountId: kind?.ActorNoPermission?.account_id,
      actorId: kind?.ActorNoPermission?.actor_id,
      type: 'actorNoPermission',
    };
  }
  if ('DeleteKeyDoesNotExist' in kind) {
    return {
      accountId: kind?.DeleteKeyDoesNotExist?.account_id,
      publicKey: kind?.DeleteKeyDoesNotExist?.public_key,
      type: 'deleteKeyDoesNotExist',
    };
  }
  if ('AddKeyAlreadyExists' in kind) {
    return {
      accountId: kind?.AddKeyAlreadyExists?.account_id,
      publicKey: kind?.AddKeyAlreadyExists?.public_key,
      type: 'addKeyAlreadyExists',
    };
  }
  if ('DeleteAccountStaking' in kind) {
    return {
      accountId: kind?.DeleteAccountStaking?.account_id,
      type: 'deleteAccountStaking',
    };
  }
  if ('LackBalanceForState' in kind) {
    return {
      accountId: kind?.LackBalanceForState?.account_id,
      amount: kind?.LackBalanceForState?.amount,
      type: 'lackBalanceForState',
    };
  }
  if ('TriesToUnstake' in kind) {
    return {
      accountId: kind?.TriesToUnstake?.account_id,
      type: 'triesToUnstake',
    };
  }
  if ('TriesToStake' in kind) {
    return {
      accountId: kind?.TriesToStake?.account_id,
      balance: kind?.TriesToStake?.balance,
      locked: kind?.TriesToStake?.locked,
      stake: kind?.TriesToStake?.stake,
      type: 'triesToStake',
    };
  }
  if ('InsufficientStake' in kind) {
    return {
      accountId: kind?.InsufficientStake?.account_id,
      minimumStake: kind?.InsufficientStake?.minimum_stake,
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
      accountId: kind?.OnlyImplicitAccountCreationAllowed?.account_id,
      type: 'onlyImplicitAccountCreationAllowed',
    };
  }
  if ('DeleteAccountWithLargeState' in kind) {
    return {
      accountId: kind?.DeleteAccountWithLargeState?.account_id,
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
      signerId: error?.InvalidSignerId?.signer_id,
      type: 'invalidSignerId',
    };
  }
  if ('SignerDoesNotExist' in error) {
    return {
      signerId: error?.SignerDoesNotExist?.signer_id,
      type: 'signerDoesNotExist',
    };
  }
  if ('InvalidNonce' in error) {
    return {
      akNonce: error?.InvalidNonce?.ak_nonce,
      transactionNonce: error?.InvalidNonce?.tx_nonce,
      type: 'invalidNonce',
    };
  }
  if ('NonceTooLarge' in error) {
    return {
      transactionNonce: error?.NonceTooLarge?.tx_nonce,
      type: 'nonceTooLarge',
      upperBound: error?.NonceTooLarge?.upper_bound,
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      receiverId: error?.InvalidReceiverId?.receiver_id,
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
      signerId: error?.NotEnoughBalance?.signer_id,
      type: 'notEnoughBalance',
    };
  }
  if ('LackBalanceForState' in error) {
    return {
      amount: error?.LackBalanceForState?.amount,
      signerId: error?.LackBalanceForState?.signer_id,
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

export function mapRpcReceiptStatus(status: ExecutionStatusView) {
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
        actions: rpcAction?.Delegate?.delegate_action?.actions?.map(
          (subaction: NonDelegateActionView, index: number) => ({
            ...mapNonDelegateRpcActionToAction(subaction),
            delegateIndex: index,
          }),
        ),
        receiverId: rpcAction?.Delegate?.delegate_action?.receiver_id,
        senderId: rpcAction?.Delegate?.delegate_action?.sender_id,
      },
      kind: 'delegateAction',
    };
  }
  return mapNonDelegateRpcActionToAction(rpcAction);
}

export function parseOutcomeOld(outcome: ParseOutcomeInfo) {
  return {
    blockHash: outcome?.block_hash,
    gasBurnt: outcome?.outcome?.gas_burnt,
    logs: outcome?.outcome?.logs,
    receiptIds: outcome?.outcome?.receipt_ids,
    status: mapRpcReceiptStatus(outcome?.outcome?.status),
    tokensBurnt: outcome?.outcome?.tokens_burnt,
  };
}

export const calculateGasUsed = (
  receiptsOutcome: ExecutionOutcomeWithIdView[],
  txnTokensBurnt: string,
) => {
  return receiptsOutcome
    ?.map((receipt) => receipt?.outcome?.gas_burnt)
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
  receiptsOutcome: ExecutionOutcomeWithIdView[],
  txnTokensBurnt: string,
) => {
  return receiptsOutcome
    .map((receipt) => receipt?.outcome?.tokens_burnt)
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
