export type U8 = number;
export type U32 = number;
export type U64 = number;
export type U128 = string;
export type Option<T> = null | T;

export type BlockHeight = U64;

export type Vec<T> = T[];

export type Gas = U64;

export type Balance = U128;

export type AccountId = string;

export type CryptoHash = string;

export type Signature = string;

export type Nonce = U64;

export type MerkleHash = CryptoHash;

export type Direction = 'Left' | 'Right';

export type MerklePathItem = {
  direction: Direction;
  hash: MerkleHash;
};

export type MerklePath = Vec<MerklePathItem>;

export type PublicKey = string;

export type AccessKeyPermissionView =
  | 'FullAccess'
  | {
      FunctionCall: {
        allowance: Option<Balance>;
        method_names: string[];
        receiver_id: string;
      };
    };

export type AccessKeyView = {
  nonce: Nonce;
  permission: AccessKeyPermissionView;
};

export type FinalExecutionStatus =
  | 'NotStarted'
  | 'Started'
  | { Failure: unknown }
  | { SuccessReceiptId: string }
  | { SuccessValue: string };

export type SignedTransactionView = {
  actions: Vec<ActionView>;
  hash: CryptoHash;
  nonce: Nonce;
  public_key: PublicKey;
  receiver_id: AccountId;
  signature: Signature;
  signer_id: AccountId;
};

export type ExecutionStatusView =
  | { Failure: unknown }
  | { SuccessReceiptId: CryptoHash }
  | { SuccessValue: string }
  | { Unknown: unknown };

export type CostGasUsed = {
  cost: string;
  cost_category: string;
  gas_used: Gas;
};

export type ExecutionMetadataView = {
  gas_profile: Option<Vec<CostGasUsed>>;
  version: U32;
};

export type ExecutionOutcomeView = {
  executor_id: AccountId;
  gas_burnt: Gas;
  logs: string[];
  metadata: ExecutionMetadataView;
  receipt_ids: Vec<CryptoHash>;
  status: ExecutionStatusView;
  tokens_burnt: Balance;
};

export type ExecutionOutcomeWithIdView = {
  block_hash: CryptoHash;
  id: CryptoHash;
  outcome: ExecutionOutcomeView;
  proof: MerklePath;
};

export type FinalExecutionOutcomeView = {
  receipts_outcome: Vec<ExecutionOutcomeWithIdView>;
  status: FinalExecutionStatus;
  transaction: SignedTransactionView;
  transaction_outcome: ExecutionOutcomeWithIdView;
};

export type NonDelegateActionView = Exclude<ActionView, DelegateActionView>;

export type DelegateAction = {
  actions: Vec<NonDelegateActionView>;
  max_block_height: BlockHeight;
  nonce: Nonce;
  public_key: PublicKey;
  receiver_id: AccountId;
  sender_id: AccountId;
};

export type DeployContractActionView = {
  DeployContract: {
    code: string;
  };
};
export type FunctionCallActionView = {
  FunctionCall: {
    args: string;
    deposit: Balance;
    gas: Gas;
    method_name: string;
  };
};
export type TransferActionView = {
  Transfer: {
    deposit: Balance;
  };
};
export type StakeActionView = {
  Stake: {
    public_key: PublicKey;
    stake: Balance;
  };
};
export type AddKeyActionView = {
  AddKey: {
    access_key: AccessKeyView;
    public_key: PublicKey;
  };
};
export type DeleteKeyActionView = {
  DeleteKey: {
    public_key: PublicKey;
  };
};
export type DeleteAccountActionView = {
  DeleteAccount: {
    beneficiary_id: AccountId;
  };
};
export type DelegateActionView = {
  Delegate: {
    delegate_action: DelegateAction;
    signature: Signature;
  };
};
export type ActionView =
  | 'CreateAccount'
  | AddKeyActionView
  | DelegateActionView
  | DeleteAccountActionView
  | DeleteKeyActionView
  | DeployContractActionView
  | FunctionCallActionView
  | StakeActionView
  | TransferActionView;

export type DataReceiverView = {
  data_id: CryptoHash;
  receiver_id: AccountId;
};

export type ReceiptEnumView =
  | {
      Action: {
        actions: Vec<ActionView>;
        gas_price: Balance;
        input_data_ids: Vec<CryptoHash>;
        output_data_receivers: Vec<DataReceiverView>;
        signer_id: AccountId;
        signer_public_key: PublicKey;
      };
    }
  | {
      Data: {
        data: Option<Vec<U8>>;
        data_id: CryptoHash;
      };
    };

export type ReceiptView = {
  predecessor_id: AccountId;
  receipt: ReceiptEnumView;
  receipt_id: CryptoHash;
  receiver_id: AccountId;
};

export type FinalExecutionOutcomeWithReceiptView = FinalExecutionOutcomeView & {
  receipts: Vec<ReceiptView>;
};

export type ActionNonDelegateAction =
  | {
      args: {};
      kind: 'createAccount';
    }
  | {
      args: {
        accessKey: {
          nonce: number;
          permission:
            | {
                contractId: string;
                methodNames: string[];
                type: 'functionCall';
              }
            | {
                type: 'fullAccess';
              };
        };
        publicKey: string;
      };
      kind: 'addKey';
    }
  | {
      args: {
        args: string;
        deposit: string;
        gas: number;
        methodName: string;
      };
      kind: 'functionCall';
    }
  | {
      args: {
        beneficiaryId: string;
      };
      kind: 'deleteAccount';
    }
  | {
      args: {
        code: string;
      };
      kind: 'deployContract';
    }
  | {
      args: {
        deposit: string;
      };
      kind: 'transfer';
    }
  | {
      args: {
        name: string;
      };
      kind: 'unknown';
    }
  | {
      args: {
        publicKey: string;
      };
      kind: 'deleteKey';
    }
  | {
      args: {
        publicKey: string;
        stake: string;
      };
      kind: 'stake';
    };

export type ActionDelegateAction = {
  args: {
    actions: (ActionNonDelegateAction & { delegateIndex: number })[];
    receiverId: string;
    senderId: string;
  };
  kind: 'delegateAction';
};

export type Action = ActionDelegateAction | ActionNonDelegateAction;

export type FailedToFindReceipt = { id: string };

export type ParsedBlock = {
  hash: string;
  height: number;
  timestamp: number;
};

type ReceiptBase = {
  actions: Action[];
  id: string;
  predecessorId: string;
  receiverId: string;
};

type ReceiptOutcome = {
  block: ParsedBlock;
  error?: string;
  gasBurnt: number;
  logs: string[];
  status: ExecutionStatusView;
  tokensBurnt: string;
};

export type ParsedReceipt = ReceiptBase & {
  outcome: ReceiptOutcome & { receiptIds: string[] };
};

export type NestedReceiptWithOutcome = ReceiptBase & {
  outcome: ReceiptOutcome & {
    nestedReceipts: (FailedToFindReceipt | NestedReceiptWithOutcome)[];
  };
};
