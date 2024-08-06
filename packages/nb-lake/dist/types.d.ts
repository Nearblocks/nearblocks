import { CredentialProvider } from "@aws-sdk/types";
export declare type BlockHeight = number;
export interface EndpointConfig {
    protocol: string;
    hostname: string;
    port: number;
    path: string;
}
export interface LakeConfig {
    credentials?: CredentialProvider;
    s3Endpoint?: EndpointConfig;
    s3BucketName: string;
    s3RegionName: string;
    startBlockHeight: number;
    blocksPreloadPoolSize?: number;
    s3ForcePathStyle?: boolean;
    fetchBlocks: (block: number, limit: number) => Promise<BlockHeight[]>;
}
export interface StreamerMessage {
    block: Block;
    shards: Shard[];
}
export interface Block {
    author: string;
    header: BlockHeader;
    chunks: ChunkHeader[];
}
export declare type ValidatorProposal = {
    accountId: string;
    publicKey: string;
    stake: string;
    validatorStakeStructVersion: string;
};
export declare type ChallengeResult = {
    accountId: string;
    isDoubleSign: boolean;
};
export interface BlockHeader {
    approvals: (string | null)[];
    blockMerkleRoot: string;
    blockOrdinal: number;
    challengesResult: ChallengeResult[];
    challengesRoot: string;
    chunkHeadersRoot: string;
    chunkMask: boolean[];
    chunkReceiptsRoot: string;
    chunkTxRoot: string;
    chunksIncluded: number;
    epochId: string;
    epochSyncDataHash: string | null;
    gasPrice: string;
    hash: string;
    height: number;
    lastDsFinalBlock: string;
    lastFinalBlock: string;
    latestProtocolVersion: number;
    nextBpHash: string;
    nextEpochId: string;
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
    validatorProposals: [];
    validatorReward: string;
}
export interface Shard {
    shardId: number;
    chunk?: Chunk;
    receiptExecutionOutcomes: ExecutionOutcomeWithReceipt[];
    stateChanges: StateChange[];
}
export interface ChunkHeader {
    balanceBurnt: number;
    chunkHash: string;
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
}
export interface Chunk {
    author: string;
    header: ChunkHeader;
    receipts: Receipt[];
    transactions: IndexerTransactionWithOutcome[];
}
export declare type ReceiptEnum = {
    Action: {
        actions: Action[];
        gasPrice: string;
        inputDataIds: string[];
        outputDataReceivers: DataReceiver[];
        signerId: string;
        signerPublicKey: string;
    };
} | {
    Data: {
        data: string;
        dataId: string;
    };
};
export declare type DataReceiver = {
    dataId: string;
    receiverId: string;
};
export declare type Receipt = {
    predecessorId: string;
    receipt: ReceiptEnum;
    receiptId: string;
    receiverId: string;
};
export declare type DeployContractAction = {
    DeployContract: {
        code: string;
    };
};
export declare type FunctionCallAction = {
    FunctionCall: {
        methodName: string;
        args: string;
        gas: number;
        deposit: string;
    };
};
export declare type TransferAction = {
    Transfer: {
        deposit: string;
    };
};
export declare type StakeAction = {
    Stake: {
        stake: number;
        publicKey: string;
    };
};
export declare type AddKeyAction = {
    AddKey: {
        publicKey: string;
        accessKey: AccessKey;
    };
};
export declare type DeleteKeyAction = {
    DeleteKey: {
        publicKey: string;
    };
};
export declare type DeleteAccountAction = {
    DeleteAccount: {
        beneficiaryId: string;
    };
};
export declare type DelegateAction = {
    Delegate: {
        delegateAction: {
            senderId: string;
            receiverId: string;
            actions: NonDelegateAction[];
            nonce: number;
            maxBlockHeight: number;
            publicKey: string;
        };
    };
    signature: string;
};
export declare type NonDelegateAction = "CreateAccount" | DeployContractAction | FunctionCallAction | TransferAction | StakeAction | AddKeyAction | DeleteKeyAction | DeleteAccountAction;
export declare type Action = "CreateAccount" | DeployContractAction | FunctionCallAction | TransferAction | StakeAction | AddKeyAction | DeleteKeyAction | DeleteAccountAction | DelegateAction;
export interface AccessKey {
    nonce: number;
    permission: string | AccessKeyFunctionCallPermission;
}
export interface AccessKeyFunctionCallPermission {
    FunctionCall: {
        allowance: string;
        receiverId: string;
        methodNames: string[];
    };
}
export declare type Transaction = {
    signerId: string;
    publicKey: string;
    nonce: number;
    receiverId: string;
    actions: Action[];
    signature: string;
    hash: string;
};
export declare type ExecutionStatus = {
    Unknown: unknown;
} | {
    Failure: unknown;
} | {
    SuccessValue: string;
} | {
    SuccessReceiptId: string;
};
export declare type ExecutionProof = {
    direction: string;
    hash: string;
};
export declare type ExecutionOutcomeWithReceipt = {
    executionOutcome: {
        blockHash: string;
        id: string;
        outcome: {
            executorId: string;
            gasBurnt: number;
            logs: string[];
            metadata: {
                gasProfile: string | null;
                version: number;
            };
            receiptIds: string[];
            status: ExecutionStatus;
            tokensBurnt: string;
        };
        proof: ExecutionProof[];
    };
    receipt: Receipt | null;
};
export declare type IndexerTransactionWithOutcome = {
    transaction: Transaction;
    outcome: ExecutionOutcomeWithReceipt;
};
export declare type StateChange = {
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
