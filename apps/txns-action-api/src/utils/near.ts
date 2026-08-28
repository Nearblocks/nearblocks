import { ActionType } from '../types/types';
import {
  Action,
  ActionInfo,
  ApiTransaction,
  ExecutionOutcomeWithIdView,
  ProcessedTokenMeta,
  ReceiptAction,
  ReceiptApiResponse,
  ReceiptTree,
  RPCTransactionInfo,
  TokenMetadataMap,
  TransactionLog,
  TransformedReceipt,
} from './types';
import { cleanNestedObject } from './libs';
import { getRequest } from './app/api';
import Big from 'big.js';

export default function toTokenMetadataMap(
  metaList: ProcessedTokenMeta[],
): TokenMetadataMap {
  return metaList.reduce((acc, item) => {
    acc[item.contractId] = item.metadata;
    return acc;
  }, {} as TokenMetadataMap);
}

export type Obj = {
  [key: string]: Obj | string;
};

export type Token = {
  asset: {
    owner: string;
  };
  base_uri: string;
  change_24: string;
  circulating_supply: string;
  coingecko_id: string;
  coinmarketcap_id: string;
  contract: string;
  decimals: string;
  description: string;
  fully_diluted_market_cap: string;
  holders: string;
  icon: string;
  market_cap: string;
  media: string;
  meta: {
    coingecko_id: string;
    facebook: string;
    telegram: string;
    twitter: string;
  };
  name: string;
  nep518_hex_address: string;
  nft: Token;
  onchain_market_cap: string;
  price: string;
  reference: string;
  symbol: string;
  title: string;
  token: string;
  tokens: string;
  total_supply: string;
  transfers: string;
  transfers_3days: string;
  transfers_day: string;
  volume_24h: string;
  website: string;
};

export type MetaInfo = {
  contract: string;
  decimals: string;
  icon: string;
  name: string;
  price: string;
  reference: string;
  symbol: string;
};

export type FtsInfo = {
  affected_account_id: string;
  block_timestamp: string;
  cause: string;
  contract: string;
  delta_amount: string;
  event_index: string;
  ft_meta: MetaInfo;
  involved_account_id: string;
};

export type NftsInfo = {
  affected_account_id: string;
  block_timestamp: string;
  cause: string;
  contract: string;
  delta_amount: string;
  event_index: string;
  involved_account_id: string;
  nft_meta: MetaInfo;
  nft_token_meta: string;
  quantity: string;
};

export type InventoryInfo = {
  fts: FtsInfo[];
  nfts: NftsInfo[];
};

export function mapRpcActionToAction(action: string | ActionType) {
  if (typeof action === 'string') {
    return {
      action_kind: action.toUpperCase(),
      args: {},
    };
  }

  if (typeof action === 'object') {
    const kind = Object.keys(action)[0];
    return {
      action_kind: kind.toUpperCase(),
      args: action[kind],
    };
  }

  return null;
}

export function txnLogs(txn: RPCTransactionInfo): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receipts_outcome || [];

  for (let i = 0; i < outcomes?.length; i++) {
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

export function isValidJson(value: string): boolean {
  try {
    const parsed = JSON.parse(value);

    return parsed && typeof parsed === 'object';
  } catch (e) {
    return false;
  }
}
export function parseNestedJSON(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => parseNestedJSON(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      try {
        result[key] = JSON.parse(Buffer.from(obj[key], 'base64').toString());
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

export const parseEventJson = (log: string) => {
  if (!log?.startsWith('EVENT_JSON:')) return log;

  const jsonString = log.replace('EVENT_JSON:', '').trim();

  if (typeof jsonString !== 'string') {
    throw new Error('jsonString is not a valid string');
  }

  if (!isValidJson(jsonString)) {
    const fixedJsonString = jsonString.replace(/\\"/g, '"');

    if (isValidJson(fixedJsonString)) {
      return JSON.parse(fixedJsonString);
    } else {
      return null;
    }
  }

  return JSON.parse(jsonString);
};

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

async function processTokenMetadata(
  logs: any[],
): Promise<ProcessedTokenMeta[]> {
  const processedTokens: ProcessedTokenMeta[] = [];
  const processedContracts = new Set();

  const fetchTokenMetadata = async (contractId: string, token_id?: string) => {
    if (processedContracts.has(contractId)) return;
    let response;

    try {
      const options: RequestInit = {};
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
      if (!contractId) {
        console.warn('Missing contract address when fetching token metadata');
        return null;
      }
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
      const logStr = log.logs;

      const matchSwap = logStr.match(/^Swapped \d+ (\S+) for \d+ (\S+)/);
      const matchWithdraw = logStr.match(/Withdraw \d+ \S+ from (\S+)/);
      const matchBurn = logStr.match(/Burned? \d+ \S+ from (\S+)/);
      const matchTransfer = logStr.match(/Transfer \d+ \S+ from \S+ to \S+/);

      if (matchSwap) {
        await fetchTokenMetadata(matchSwap[1]);
        await fetchTokenMetadata(matchSwap[2]);
      } else if (matchWithdraw) {
        await fetchTokenMetadata(log.contract);
      } else if (matchBurn || matchTransfer) {
        await fetchTokenMetadata(log.contract);
      } else {
        await fetchTokenMetadata(log.contract);
      }
    }
  }

  return processedTokens;
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

export const calculateGasUsed = (
  receiptsOutcome: ExecutionOutcomeWithIdView[],
  txnTokensBurnt: string,
) => {
  return receiptsOutcome
    ?.map((receipt) => receipt?.outcome?.gas_burnt)
    ?.reduce((acc, fee) => Big(acc)?.add(fee)?.toString(), txnTokensBurnt);
};

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

export const txnFee = (
  receiptsOutcome: ExecutionOutcomeWithIdView[],
  txnTokensBurnt: string,
) => {
  return receiptsOutcome
    .map((receipt) => receipt?.outcome?.tokens_burnt)
    ?.reduce((acc, fee) => Big(acc)?.add(fee)?.toString(), txnTokensBurnt);
};
