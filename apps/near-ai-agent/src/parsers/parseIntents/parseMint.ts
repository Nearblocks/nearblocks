import { ParsedLog } from 'src/utils/app/config';
import { TransactionLog } from 'src/utils/types';
import { getNetworkDetails, networkFullNames } from 'src/utils/near';
import { chainAbstractionExplorerUrl } from 'src/utils/app/config';

interface MintInput {
  event: TransactionLog;
  data: {
    owner_id: string;
    token_ids: string[];
    amounts: string[];
  }[];
  parsedActionLogs?: any[];
  meta: any;
}

export async function parseMint({
  event,
  data,
  parsedActionLogs,
  meta,
}: MintInput) {
  const receiverId = data[0]?.owner_id;
  const token = data[0]?.token_ids?.[0]?.split(':')[1];
  const tokenNetwork = getNetworkDetails(token);

  let sender = '';
  let receiver = '';
  let externalLink = '';
  let txHash = '';
  let network: string | null = null;

  if (parsedActionLogs?.length && receiverId) {
    const relevantLog = parsedActionLogs.find(
      (log) => log?.parsedArgs?.sender_id && log?.parsedArgs?.receiver_id,
    );

    if (relevantLog) {
      sender = relevantLog?.parsedArgs?.sender_id;
      receiver = relevantLog?.parsedArgs?.receiver_id;
    }

    const extracted = parsedActionLogs
      .map((log) => {
        try {
          const memo = log?.parsedArgs?.memo || '';
          const logs = JSON.parse(log?.parsedArgs?.msg || '{}');
          const bridgedFromMatch = memo?.match(/BRIDGED_FROM:(\{.*\})/);

          if (bridgedFromMatch) {
            const bridgedFromObj = JSON.parse(bridgedFromMatch[1]);
            if (logs?.receiver_id === receiverId) return bridgedFromObj;
          }
        } catch {
          return null;
        }
        return null;
      })
      .filter(Boolean) as ParsedLog[];

    if (extracted?.length) {
      const { txHash: bridgedTxHash, networkType } = extracted[0];
      network = networkFullNames[networkType];
      txHash = bridgedTxHash;

      if (
        tokenNetwork === network &&
        chainAbstractionExplorerUrl[
          network as keyof typeof chainAbstractionExplorerUrl
        ]
      ) {
        externalLink =
          chainAbstractionExplorerUrl[
            network as keyof typeof chainAbstractionExplorerUrl
          ].transaction?.(txHash) || '';
      }
    }
  }

  return {
    type: 'mint',
    contract: 'intents.near',
    receiverId,
    receiver,
    sender,
    tokens: data
      .map(({ token_ids, amounts }) =>
        token_ids.map((t, idx) => ({
          token: t.split(':')[1],
          amount: amounts[idx],
          meta: meta.find((m: any) => m.contractId === t.split(':')[1]) || null,
        })),
      )
      .flat(),
    bridgedTx: {
      hash: txHash,
      externalLink,
      network,
    },
    receiptId: event.receiptId ?? '',
  };
}
