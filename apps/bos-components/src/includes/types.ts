import { ValidatorEpochData, ValidatorTelemetry } from 'nb-types';

export type SatsInfo = {
  near_price: number;
};

export type AccountTimestampInfo = {
  block_timestamp: number;
  transaction_hash: string;
};

export type AccountInfo = {
  account_id: string;
  amount: number;
  code_hash: string;
  created: AccountTimestampInfo;
  deleted: AccountTimestampInfo;
  locked: string;
  storage_usage: number;
};

export type DeploymentsInfo = {
  block_timestamp: number;
  receipt_predecessor_account_id: string;
  transaction_hash: string;
};

export type TokenInfo = {
  name: string;
  icon: string;
  symbol: string;
  price: number;
  website: string;
};

export type MetaInfo = {
  decimals: number;
  icon: string;
  name: string;
  price: number;
  reference: string;
  symbol: string;
};

export type FtsInfo = {
  amount: number;
  contract: string;
  ft_metas: MetaInfo;
};

export type NftsInfo = {
  amount: number;
  contract: string;
  nft_meta: MetaInfo;
  quantity: number;
  nft_token_meta: string;
};

export type InventoryInfo = {
  fts: FtsInfo[];
  nfts: NftsInfo[];
};

export type ContractCodeInfo = {
  block_hash: string;
  block_height: number;
  code_base64: string;
  hash: string;
};

export type KeysInfo = {
  access_key: {
    nonce: number;
    permission: string;
  };
  public_key: string;
};

export type AccessKeyInfo = {
  block_hash: string;
  block_height: number;
  keys: KeysInfo[];
  hash: string;
};

export type ContractInfo = {
  locked?: boolean;
  hash: string;
};

export type TokenListInfo = {
  amount: number;
  contract: string;
  ft_metas: MetaInfo;
  rpcAmount: number;
  amountUsd: number;
};

export type FtInfo = {
  amount: number;
  tokens: TokenListInfo[];
};

export type BlocksInfo = {
  author_account_id: string;
  block_hash: string;
  block_height: number;
  block_timestamp: number;
  chunks_agg: {
    gas_limit: number;
    gas_used: number;
  };
  gas_price: number;
  prev_block_hash: string;
  receipts_agg: {
    count: number;
  };
  transactions_agg: {
    count: number;
  };
};

export type StatusInfo = {
  avg_block_time: number;
  block: number;
  change_24: number;
  gas_price: number;
  high_24h: number;
  high_all: number;
  low_24h: number;
  low_all: number;
  market_cap: number;
  near_btc_price: number;
  near_price: number;
  nodes: number;
  nodes_online: number;
  total_supply: number;
  total_txns: number;
  volume: number;
};

export type ChartSeriesInfo = {
  type: string;
  data: number[];
  color: string;
};

export type ChartConfigType = {
  chart: {
    height: number;
    spacingTop: number;
    spacingBottom: number;
    spacingLeft: number;
    spacingRight: number;
  };
  title: {
    text: null;
  };
  xAxis: {
    type: string;
    lineWidth: number;
    tickLength: number;
    labels: {
      step: number;
    };
    categories: string;
  };
  yAxis: {
    gridLineWidth: number;
    title: {
      text: null;
    };
  };
  legend: {
    enabled: boolean;
  };
  plotOptions: {
    spline: {
      lineWidth: number;
      states: {
        hover: {
          lineWidth: number;
        };
      };
      marker: {
        radius: number;
      };
    };
  };
  series: [ChartSeriesInfo];
  exporting: {
    enabled: boolean;
  };
  credits: {
    enabled: boolean;
  };
};

export type ChartInfo = {
  date: string;
  near_price: string;
  txns: string;
};

export type TransactionInfo = {
  actions: {
    action: string;
    method: string;
  }[];
  actions_agg: {
    deposit: number;
    gas_attached: string;
  };
  block: {
    block_height: number;
  };
  block_timestamp: string;
  included_in_block_hash: string;
  outcomes: {
    status: boolean;
  };
  outcomes_agg: {
    transaction_fee: number;
    gas_used: string;
  };
  receipt_conversion_gas_burnt: string;
  receipt_conversion_tokens_burnt: string;
  receiver_account_id: string;
  signer_account_id: string;
  transaction_hash: string;
  receipts: InventoryInfo[];
  event_kind: string;
  token_old_owner_account_id: string;
  token_new_owner_account_id: string;
  token_id: string;
  nft: Token;
  amount: string;
  ft: Token;
};

export type ChartStat = {
  date: string;
  near_price: string;
  market_cap: string;
  total_supply: string;
  blocks: string;
  gas_fee: string;
  gas_used: string;
  avg_gas_price: string;
  avg_gas_limit: string;
  txns: string;
  txn_volume: string;
  txn_volume_usd: string;
  txn_fee: string;
  txn_fee_usd: string;
  total_addresses: string;
  addresses: string;
};

export type ChartTypeInfo = {
  title: string;
  description: string;
};

export type ChartConfig = {
  chart: {
    height: number;
    zoomType: string;
  };
  title: {
    text: string;
  };
  subtitle: {
    text: string;
  };
};

export type EpochStartBlock = {
  height: number;
  timestamp: number;
  totalSupply: string;
};
export type SearchResult = {
  accounts?: Array<{ account_id: string }>;
  txns?: Array<{ transaction_hash: string }>;
  receipts?: Array<{
    receipt_id: string;
    originated_from_transaction_hash: string;
  }>;
  blocks?: Array<{ block_hash: string; block_height: number }>;
};
export type SearchRoute = {
  type?: string;
  path?: string;
};
export type Debounce<TArgs extends any[]> = {
  (args: TArgs): void;
  cancel(): void;
  isPending(): boolean;
  flush(args: TArgs): void;
};

export type FunctionCallInfo = {
  args: string;
  deposit: string;
  gas: number;
  method_name: string;
};

export type GasProfileInfo = {
  cost: string;
  cost_category: string;
  gas_used: string;
};

export type OutcomePropsInfo = {
  executor_id: string;
  gas_burnt: number;
  logs: [];
  metadata: {
    gas_profile: GasProfileInfo[];
    version: number;
  };
  outgoing_receipts: {
    actions: {
      action_kind: string;
      args: {
        stake: number;
        deposit: number;
      };
    }[];
    outcome: OutcomePropsInfo;
  };
  receipt_ids: string[];
  status: {
    Failure: {
      ActionError: {
        index: number;
        kind: {
          FunctionCallError: {
            ExecutionError: string;
          };
        };
      };
    };
  };
  tokens_burnt: string;
};

export type OutcomeInfo = {
  block_hash: string;
  id: string;
  outcome: OutcomePropsInfo;
  proof: {
    direction: string;
    hash: string;
  }[];
};

export type ReceiptsInfo = {
  predecessor_id: string;
  receipt: {
    Action: {
      actions: {
        FunctionCall: FunctionCallInfo;
      }[];
      gas_price: string;
      input_data_ids: [];
      output_data_receivers: [];
      signer_id: string;
      signer_public_key: string;
    };
  };
  receipt_id: string;
  receiver_id: string;
};

export type InfoStatus = {
  Failure: {
    ActionError: {
      index: number;
      kind: {
        FunctionCallError: {
          ExecutionError: string;
        };
      };
    };
  };
};

export type TransInfo = {
  actions: {
    FunctionCall: FunctionCallInfo[];
  }[];
  hash: string;
  nonce: number;
  public_key: string;
  receiver_id: string;
  signature: string;
  signer_id: string;
};

export type RPCTransactionInfo = {
  receipts: ReceiptsInfo[];
  receipts_outcome: OutcomeInfo[];
  status: InfoStatus;
  transaction: TransInfo;
  transaction_outcome: OutcomeInfo;
};

export type TransactionLog = {
  contract: string | undefined;
  logs: string;
};

export type ActionType = {
  [key: string]: any;
};

export type Obj = {
  [key: string]: string | Obj;
};

export type AccountContractInfo = {
  amount: string;
  block_hash: string;
  block_height: number;
  code_hash: string;
  locked: string;
  storage_paid_at: number;
  storage_usage: number;
  account_id: string;
  created: {
    transaction_hash: string;
    block_timestamp: string;
  };
  deleted: {
    transaction_hash: string;
    block_timestamp: string;
  };
};

export type EventPropsInfo = {
  event: TransactionLog;
  network: string;
};

export type DepositPropsInfo = {
  event: {
    token_id: string;
    account_id: string;
    amount: string;
  }[];
  network: string;
};

export type ActionPropsInfo = {
  action: {
    from: string;
    to: string;
    action_kind: string;
    args: {
      stake: number;
      deposit: number;
    };
  };
};
export type ArgsPropsInfo = {
  access_key: {
    permission: {
      permission_kind: string;
      FunctionCall: {
        method_names: [];
        receiver_id: string;
      };
    };
  };
  public_key: string;
  beneficiary_id: string;
  method_name: string;
  args_base64: string;
  args: string;
  stake: number;
  deposit: number;
};

export type TransactionActionInfo = {
  args: ArgsPropsInfo;
  receiver: string;
  t: (key: string) => string | undefined;
};

export type ReceiptsPropsInfo = {
  actions: {
    action_kind: string;
    args: {
      deposit: string;
      access_key: {
        nonce: number;
        permission: string;
      };
      public_key: string;
    };
  }[];
  block_hash: string;
  id: string;
  outcome: {
    executor_id: string;
    gas_burnt: number;
    logs: [];
    metadata: {
      gas_profile: [];
      version: number;
    };
    receipt_ids: string[];
    status: {
      SuccessValue: string;
    };
    tokens_burnt: number;
    outgoing_receipts: {
      predecessor_id: string;
      receipt: {
        Action: {
          actions: [
            {
              Transfer: {
                deposit: string;
              };
            },
          ];
          gas_price: string;
          input_data_ids: [];
          output_data_receivers: [];
          signer_id: string;
          signer_public_key: string;
        };
      };
      receipt_id: string;
      receiver_id: string;
      actions: {
        action_kind: string;
        args: {
          deposit: string;
        };
      }[];
      block_hash: string;
      id: string;
      outcome: {
        executor_id: string;
        gas_burnt: number;
        logs: [];
        metadata: {
          gas_profile: [];
          version: number;
        };
        receipt_ids: [];
        status: {
          SuccessValue: string;
        };
        tokens_burnt: number;
        outgoing_receipts: [];
      };
      proof: {
        direction: string;
        hash: string;
      }[];
    }[];
  };
  predecessor_id: string;
  proof: {
    direction: string;
    hash: string;
  }[];
  receipt: {
    Action: {
      actions: [
        string,
        {
          Transfer: {
            deposit: string;
          };
        },
        {
          AddKey: {
            access_key: {
              nonce: 0;
              permission: string;
            };
            public_key: string;
          };
        },
      ];
      gas_price: string;
      input_data_ids: [];
      output_data_receivers: [];
      signer_id: string;
      signer_public_key: string;
    };
  };
  receipt_id: string;
  receiver_id: string;
};

export type Sorting = {
  sort: string;
  order: 'asc' | 'desc';
};

export type Token = {
  name: string;
  contract: string;
  icon: string;
  symbol: string;
  price: number | null;
  change_24: number | null;
  volume_24h: number | null;
  market_cap: number | null;
  onchain_market_cap: number | null;
  holders: number;
  base_uri: string;
  reference: string;
  tokens: number;
  transfers: number;
  transfers_3days: number;
  transfers_day: number;
  website: string;
  meta: {
    twitter: string;
    facebook: string;
    telegram: string;
    coingecko_id: string;
  };
  token: string;
  media: string;
  asset: {
    owner: string;
  };
  decimals: number;
};

export type TransActionProps = {
  key: number;
  action: {
    action_kind: string;
    args: ArgsPropsInfo;
  };
  receiver: any;
  t: (key: string) => string | undefined;
};

export type TokenInfoProps = {
  contract: string;
  amount: number;
  decimals: number;
  network: string;
};

export type ValidatorFullData = {
  validatorEpochData: ValidatorEpochData[];
  currentValidators: number;
  totalStake: number;
  seatPrice: number;
  elapsedTime: number;
  totalSeconds: number;
  epochProgress: number;
  validatorTelemetry: {
    [accountId: string]: ValidatorTelemetry;
  };
  total: number;
};

export type ReceiptStatsProps = {
  receipt: {
    outcome: {
      status: {
        SuccessValue?: any;
        Failure?: any;
        SuccessReceiptId?: any;
      };
    };
  };
};

export type HoldersPropsInfo = {
  account: string;
  quantity: number;
};

export type NFTImageProps = {
  base?: string;
  media?: string;
  alt?: string;
  reference?: string;
  className?: string;
  network: string;
};
