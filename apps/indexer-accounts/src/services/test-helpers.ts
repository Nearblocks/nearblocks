import { Action, Message } from 'nb-neardata';

import { publicKeyFromImplicitAccount } from '#libs/utils';

export const ts = (n: number): string =>
  String(1712163441591948000n + BigInt(n));

export const implicitPublicKey = (accountId: string): string => {
  const key = publicKeyFromImplicitAccount(accountId);

  if (!key) {
    throw new Error(`could not derive public key for ${accountId}`);
  }

  return key;
};

type TestReceipt = {
  actions: Action[];
  receiptId: string;
  receiverId: string;
};

export const oneBlockMessage = (receipts: TestReceipt[]): Message =>
  ({
    block: { header: { height: 1, timestampNanosec: ts(0) } },
    shards: [
      {
        receiptExecutionOutcomes: receipts.map((r) => ({
          executionOutcome: {
            id: r.receiptId,
            outcome: { status: { SuccessValue: '' } },
          },
          receipt: {
            predecessorId: 'relay.near',
            receipt: { Action: { actions: r.actions } },
            receiptId: r.receiptId,
            receiverId: r.receiverId,
          },
        })),
      },
    ],
  }) as unknown as Message;
