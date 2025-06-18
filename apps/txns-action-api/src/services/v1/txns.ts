import { Response } from 'express';
import { ApiTxnData } from 'src/utils/types';

import catchAsync from '../../libs/async';
import { Txn } from '../../libs/schema/v1/txns';
import { RequestValidator } from '../../types/types';
import { parseEventLogs } from 'src/parsers/eventParser';
import toTokenMetadataMap from 'src/utils/near';
import { ActionParser } from 'src/parsers/actionParsers/actionParser';

const parsedTxn = catchAsync(
  async (req: RequestValidator<Txn>, res: Response) => {
    const { txnData } = req.body;

    const apiTxnActionsData: ApiTxnData = txnData;
    const { apiLogs, apiMainActions, tokenMetadata, apiAllActions } =
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
          logs: [...txn.logs, ...filteredApiNepLogs],
        };
      }
    });

    const updatedMainTxnsActions =
      apiMainTxnsActions?.length > 0 ? apiMainTxnsActions : null;

    const logsDetails = updatedMainTxnsActions?.[0]?.logs || [];

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
    if (logsDetails?.length === 0 || NonNEP245) {
      const parsedActions = updatedMainTxnsActions?.map((action: any) =>
        ActionParser.parseAction(action),
      );

      return res.status(200).json({
        parsedResponse: parsedActions,
      });
    }

    const tokenMetadataMap = Array.isArray(tokenMetadata)
      ? toTokenMetadataMap(tokenMetadata)
      : tokenMetadata;

    const response = await parseEventLogs(
      logsDetails,
      tokenMetadataMap,
      apiAllActions,
    );

    return res.status(200).json({
      parsedResponse: response,
    });
  },
);

export default { parsedTxn };
