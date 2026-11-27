import { Response } from 'express';
import { ApiTxnData } from 'src/utils/types';

import catchAsync from '../../libs/async';
import { Txn } from '../../libs/schema/v1/txns';
import { RequestValidator } from '../../types/types';
import { parseEventLogs } from 'src/parsers/eventParser';
import toTokenMetadataMap, {
  mainActions,
  processTransactionWithTokens,
  txnLogs,
} from 'src/utils/near';
import { ActionParser } from 'src/parsers/actionParsers/actionParser';
import { getRequest } from 'src/utils/app/api';
import { parseRpcTxn } from './RpcTxn';
import { getFailoverProvider, shouldUseRpc } from 'src/utils/libs';

const parsedTxn = catchAsync(
  async (req: RequestValidator<Txn>, res: Response) => {
    let rpcTxn: any = null;
    const networkId = process.env.NETWORK;
    const { hash } = req.params;
    const { txns } = req.body;
    const cacheRef = { current: {} };
    const options: RequestInit = {};
    const provider = getFailoverProvider(networkId);
    const receipt =
      (await getRequest(`v2/txns/${hash}/receipts`, {}, options)) || [];

    const txnData: ApiTxnData = await processTransactionWithTokens(
      txns,
      receipt,
    );

    if (txns && shouldUseRpc(txns.block?.block_height)) {
      rpcTxn = await parseRpcTxn({
        hash,
        signerId: txns.signer_account_id,
        provider,
        cacheRef,
      });
    }

    let rpcLogs = [];
    let rpcMainActions = [];

    if (rpcTxn && Object.keys(rpcTxn).length > 0) {
      rpcLogs = txnLogs(rpcTxn.raw);

      rpcMainActions = mainActions(rpcTxn.raw);
    }

    const rpcMainTxnsActions =
      rpcMainActions &&
      rpcMainActions?.map((txn) => {
        const filteredNepLogs = rpcLogs?.filter((item: any) => {
          try {
            const logContent = item?.logs?.match(/EVENT_JSON:(\{.*\})/);
            if (logContent) {
              const jsonLog = JSON.parse(logContent[1]);
              return jsonLog?.standard === 'nep245';
            }
            return false;
          } catch {
            return false;
          }
        });

        if (filteredNepLogs?.length > 0) {
          return {
            ...txn,
            logs: [...filteredNepLogs],
          };
        } else {
          return {
            ...txn,
            logs: [...txn.logs, ...filteredNepLogs],
          };
        }
      });

    const apiTxnActionsData: ApiTxnData = txnData;
    const { apiLogs, tokenMetadata, apiAllActions, apiMainActions } =
      apiTxnActionsData;

    const apiMainTxnsActions = apiMainActions?.map((txn: any) => {
      const filteredApiNepLogs = apiLogs?.filter((log: any) => {
        try {
          if (
            log?.logs?.standard === 'nep245' ||
            log?.logs?.standard === 'dip4'
          ) {
            return log;
          }
          return false;
        } catch {
          return false;
        }
      });

      if (filteredApiNepLogs?.length > 0) {
        return {
          ...txn,
          logs: [...filteredApiNepLogs],
        };
      } else {
        return {
          ...txn,
          logs: [...(txn.logs || []), ...filteredApiNepLogs],
        };
      }
    });

    const updatedMainTxnsActions =
      apiMainTxnsActions &&
      apiMainTxnsActions.length > 0 &&
      !shouldUseRpc(txns.block?.block_height)
        ? apiMainTxnsActions
        : rpcMainTxnsActions || [];

    const logsDetails =
      (updatedMainTxnsActions?.[0]?.logs?.length
        ? updatedMainTxnsActions[0].logs
        : updatedMainTxnsActions?.[0]?.actionsLog) || [];

    const NonNEP245 = (() => {
      try {
        return logsDetails?.every((log: any) => {
          const logData = log?.logs;
          if (
            typeof logData === 'string' &&
            logData.startsWith('EVENT_JSON:')
          ) {
            const parsedJson = JSON.parse(logData.replace('EVENT_JSON:', ''));
            return parsedJson?.standard !== 'nep245';
          }
          return logData?.standard !== 'nep245';
        });
      } catch {
        return false;
      }
    })();

    let baseActions: any[] = [];
    if (logsDetails.length > 0 && NonNEP245) {
      const parsedActions = updatedMainTxnsActions?.map((action: any) => {
        const parsedAction = ActionParser.parseAction(action);
        return parsedAction;
      });

      const parsedActionsFiltered = parsedActions?.filter(
        (a) => a && Object.keys(a).length > 0,
      );
      baseActions = Array.isArray(parsedActionsFiltered)
        ? parsedActionsFiltered.flat()
        : [];
    }

    const tokenMetadataMap = Array.isArray(tokenMetadata)
      ? toTokenMetadataMap(tokenMetadata)
      : tokenMetadata;

    let finalActions: any[] = [];

    let eventLogActions: any[] = [];

    const response = (
      await Promise.all(
        logsDetails.map((log: any) =>
          parseEventLogs(log, tokenMetadataMap, apiAllActions),
        ),
      )
    ).flat();

    eventLogActions = Array.isArray(response) ? response.flat() : [];

    finalActions = [...baseActions, ...eventLogActions];

    return res.status(200).json({
      Actions: finalActions,
    });
  },
);

export default { parsedTxn };
