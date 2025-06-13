import {
  ApiTransaction,
  ReceiptApiResponse,
  TransactionLog,
  ActionInfo,
  TransformedReceipt,
  ReceiptTree,
  ProcessedTokenMeta,
  ReceiptAction,
} from './types';
import { parseEventJson } from './libs';
import { getFTMetaByContract } from '#libs/db/fts';

function processApiAction(action: any, args?: any) {
  if (!action) return {};
  return {
    action_kind: action?.action,
    args: {
      method_name: action?.method,
      args: action?.args,
      deposit: args?.deposit || 0,
      gas: args?.gas_attached || 0,
      ...action?.args_full,
    },
  };
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

export const transformReceiptData = (
  apiData: ReceiptApiResponse | null,
): TransformedReceipt | null => {
  if (!apiData || !apiData.receipts || !apiData.receipts.length) {
    return null;
  }

  const transformReceipt = (
    receiptTree: ReceiptTree | undefined,
  ): TransformedReceipt | null => {
    if (!receiptTree) return null;
    const outgoingReceipts = receiptTree?.receipts
      ? receiptTree?.receipts
          .map((childReceipt) => transformReceipt(childReceipt))
          .filter((receipt): receipt is TransformedReceipt => receipt !== null)
      : [];

    const receipt: TransformedReceipt = {
      receipt_id: receiptTree?.receipt_id,
      predecessor_id: receiptTree?.predecessor_account_id,
      receiver_id: receiptTree?.receiver_account_id,
      block_hash: receiptTree?.block?.block_hash,
      block_height: receiptTree?.block?.block_height || null,
      actions: receiptTree?.actions?.map((action) => ({
        ...action,
        args: {
          ...action?.args,
          deposit: action?.args?.deposit || '0',
        },
      })),
      outcome: {
        logs: receiptTree?.outcome?.logs || [],
        status: convertStatus(receiptTree?.outcome?.status),
        gas_burnt: receiptTree?.outcome?.gas_burnt,
        tokens_burnt: receiptTree?.outcome?.tokens_burnt,
        executor_account_id: receiptTree?.outcome?.executor_account_id,
        outgoing_receipts: outgoingReceipts,
      },
      public_key: receiptTree?.public_key,
    };

    return receipt;
  };

  const convertStatus = (
    status: any,
  ): {
    SuccessValue?: string;
    SuccessReceiptId?: string;
    Failure?: { error_message: string };
  } => {
    if (status === true) {
      return { SuccessValue: '' };
    } else if (status === false) {
      return { Failure: { error_message: 'Transaction failed' } };
    } else {
      return status;
    }
  };

  const rootReceipt = apiData?.receipts?.[0].receipt_tree;
  return transformReceipt(rootReceipt);
};

async function processTokenMetadata(
  logs: any[],
): Promise<ProcessedTokenMeta[]> {
  const processedTokens: ProcessedTokenMeta[] = [];
  const processedContracts = new Set();

  const fetchTokenMetadata = async (contractId: string) => {
    if (processedContracts.has(contractId)) return;

    try {
      //   const options =  { next: { revalidate: 10 } };
      const response = await getFTMetaByContract(contractId);
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
    apiMainActions,
    apiSubActions,
    apiAllActions,
    apiActionLogs,
    receiptData,
    tokenMetadata,
  };
}
