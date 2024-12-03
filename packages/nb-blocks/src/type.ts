export type Message = {
  block: Block;
  shards: Shard[];
};

export type Block = {
  author: string;
  header: BlockHeader;
};

export type BlockHeader = {
  blockBodyHash: string;
  blockMerkleRoot: string;
  blockOrdinal: number;
  challengesRoot: string;
  chunkHeadersRoot: string;
  chunkReceiptsRoot: string;
  chunksIncluded: number;
  chunkTxRoot: string;
  epochID: string;
  epochSyncDataHash: null | string;
  gasPrice: string;
  hash: string;
  height: number;
  lastDsFinalBlock: string;
  lastFinalBlock: string;
  latestProtocolVersion: number;
  nextBpHash: string;
  nextEpochID: string;
  outcomeRoot: string;
  prevHash: string;
  prevHeight: number;
  prevStateRoot: string;
  randomValue: string;
  rentPaid: string;
  signature: string;
  timestamp: number;
  timestampNanosec: string;
  totalSupply: string;
  validatorReward: string;
};

export type Shard = {
  chunk?: Chunk;
  receiptExecutionOutcomes: ExecutionOutcomeWithReceipt[];
  shardId: number;
  stateChanges: StateChange[];
};

export type Chunk = {
  author: string;
  header: ChunkHeader;
  receipts: Receipt[];
  transactions: IndexerTransactionWithOutcome[];
};

export type ChunkHeader = {
  balanceBurnt: string;
  chunkHash: string;
  congestionInfo: CongestionInfo;
  encodedLength: number;
  encodedMerkleRoot: string;
  gasLimit: number;
  gasUsed: number;
  heightCreated: number;
  heightIncluded: number;
  outcomeRoot: string;
  outgoingReceiptsRoot: string;
  prevBlockHash: string;
  prevStateRoot: string;
  rentPaid: string;
  shardId: number;
  signature: string;
  txRoot: string;
  validatorProposals: ValidatorProposal[];
  validatorReward: string;
};

export type CongestionInfo = {
  allowedShard: number;
  bufferedReceiptsGas: string;
  delayedReceiptsGas: string;
  receiptBytes: number;
};

export type ValidatorProposal = {
  accountId: string;
  publicKey: string;
  stake: string;
  validatorStakeStructVersion: string;
};

export type Receipt = {
  predecessorId: string;
  receipt: ReceiptEnum;
  receiptId: string;
  receiverId: string;
};

export type ReceiptEnum =
  | {
      Action: {
        actions: Action[];
        gasPrice: string;
        inputDataIds: string[];
        outputDataReceivers: DataReceiver[];
        signerId: string;
        signerPublicKey: string;
      };
    }
  | {
      Data: {
        data: string;
        dataId: string;
      };
    };
export type Action =
  | 'CreateAccount'
  | AddKeyAction
  | DelegateAction
  | DeleteAccountAction
  | DeleteKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | TransferAction;

export type NonDelegateAction =
  | 'CreateAccount'
  | AddKeyAction
  | DeleteAccountAction
  | DeleteKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | TransferAction;

export type AddKeyAction = {
  AddKey: {
    accessKey: AccessKey;
    publicKey: string;
  };
};

export type DelegateAction = {
  Delegate: {
    delegateAction: {
      actions: NonDelegateAction[];
      maxBlockHeight: number;
      nonce: number;
      publicKey: string;
      receiverId: string;
      senderId: string;
    };
  };
  signature: string;
};

export type DeleteAccountAction = {
  DeleteAccount: {
    beneficiaryId: string;
  };
};

export type DeleteKeyAction = {
  DeleteKey: {
    publicKey: string;
  };
};

export type DeployContractAction = {
  DeployContract: {
    code: string;
  };
};

export type FunctionCallAction = {
  FunctionCall: {
    args: string;
    deposit: string;
    gas: number;
    methodName: string;
  };
};

export type StakeAction = {
  Stake: {
    publicKey: string;
    stake: number;
  };
};

export type TransferAction = {
  Transfer: {
    deposit: string;
  };
};

export type AccessKey = {
  nonce: number;
  permission: AccessKeyFunctionCallPermission | string;
};

export type AccessKeyFunctionCallPermission = {
  FunctionCall: {
    allowance: string;
    methodNames: string[];
    receiverId: string;
  };
};

export type DataReceiver = {
  dataId: string;
  receiverId: string;
};

export type ExecutionOutcomeWithReceipt = {
  executionOutcome: {
    blockHash: string;
    id: string;
    outcome: {
      executorId: string;
      gasBurnt: number;
      logs: string[];
      receiptIds: string[];
      status: ExecutionStatus;
      tokensBurnt: string;
    };
  };
  receipt: null | Receipt;
  txHash: string;
};

export type ExecutionStatus =
  | {
      Failure: unknown;
    }
  | {
      SuccessReceiptId: string;
    }
  | {
      SuccessValue: string;
    }
  | {
      Unknown: unknown;
    };

export type StateChange = {
  cause: {
    receiptHash: string;
    type: string;
  };
  change: {
    accountId: string;
    keyBase64: string;
    valueBase64: string;
  };
  type: string;
};

export type IndexerTransactionWithOutcome = {
  outcome: ExecutionOutcomeWithReceipt;
  transaction: Transaction;
};

export type Transaction = {
  actions: Action[];
  hash: string;
  nonce: number;
  priorityFee: number;
  publicKey: string;
  receiverId: string;
  signature: string;
  signerId: string;
};
