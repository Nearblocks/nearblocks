import { Response } from 'express';
import { ApiTxnData } from 'src/utils/types';

import catchAsync from '../../libs/async';
import { Txn } from '../../libs/schema/v1/txns';
import { RequestValidator } from '../../types/types';
import { processTransactionWithTokens } from 'src/utils/processTransactionWithTokens';
import { getTxnFull, getTxnReceipts } from '#libs/db/txns';

const parsedTxn = catchAsync(
  async (req: RequestValidator<Txn>, res: Response) => {
    const hash = req.validator.data.hash;

    const txnResult = await getTxnFull(hash);

    const receiptResult = await getTxnReceipts(hash);

    const txn = txnResult?.[0];
    const receipt = receiptResult?.[0]?.receipt_tree;

    if (!txn || !receipt) {
      return res
        .status(404)
        .json({ error: 'Transaction or receipt not found' });
    }

    const apiTxnActionsData: ApiTxnData = await processTransactionWithTokens(
      txn,
      receipt,
    );

    const { logs: apiLogs, apiActions } = apiTxnActionsData;

    const apiMainTxnsActions = apiActions?.map((txn: any) => {
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
          logs: [...txn.logs, ...filteredApiNepLogs],
        };
      }
    });

    const parsed = apiMainTxnsActions;

    const response = parsed.map((txn) => {
      // return {
      //   from: txn.from,
      //   to: txn.to,
      //   method: txn.actionsLog?.[0]?.args?.method_name || null,
      //   args: txn.actionsLog?.[0]?.args?.args_json || {},
      //   receiptId: txn.receiptId,
      // };
      const logs = txn.logs?.map((log: any) => {
        console.log('log from console', log);
      });
      return logs;
    });

    return res.status(200).json({ actions: response });
  },
);

export default { parsedTxn };
