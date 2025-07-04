import { useRpcStore } from '@/stores/app/rpc';
import { decodeArgs, encodeArgs } from '@/utils/app/near';
import { AccessInfo } from '@/utils/types';
import { BlockResult } from 'near-api-js/lib/providers/provider';

type QueryResponse = {
  data?: any;
  error?: any;
  statusCode: number;
};

export const fetchJsonRpc = async (
  rpcUrl: string,
  params: any,
  method: string = 'query',
): Promise<QueryResponse> => {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method,
        params,
      }),
    });
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      return {
        statusCode: res.status,
        error: {
          message: 'Invalid JSON response',
          raw: text.substring(0, 200),
        },
      };
    }
    if (body.error) {
      return {
        statusCode: res.status,
        error: body.error,
      };
    }
    return {
      statusCode: res.status,
      ...(res.ok ? { data: body } : { error: body }),
    };
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    return {
      statusCode: 0,
      error: { message: 'Network error', details: fetchError },
    };
  }
};

const useRpc = () => {
  const rpcUrl = useRpcStore((state) => state.rpc);
  const getBlockDetails = async (blockId: number | string) => {
    try {
      const { data, error } = await fetchJsonRpc(
        rpcUrl,
        { block_id: blockId },
        'block',
      );
      if (data) {
        return data.result as BlockResult;
      } else {
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error fetching latest block details:', error);
      return null;
    }
  };

  const ftBalanceOf = async (
    contract: string,
    account_id?: string,
    cacheRef?: any,
  ) => {
    const cacheKey = `${rpcUrl}_${contract}_${account_id}`;

    if (cacheRef?.current && cacheKey in cacheRef.current) {
      return cacheRef.current[cacheKey];
    }

    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        request_type: 'call_function',
        finality: 'final',
        account_id: contract,
        method_name: 'ft_balance_of',
        args_base64: encodeArgs({ account_id: account_id?.toLowerCase() }),
      });

      if (data && statusCode === 200) {
        const result = data.result?.result
          ? decodeArgs(data.result.result)
          : null;

        if (cacheRef?.current) {
          cacheRef.current[cacheKey] = result;
        }

        return result;
      } else {
        if (cacheRef?.current) {
          cacheRef.current[cacheKey] = null;
        }

        console.error('Error in ftBalanceOf:', error || 'Unknown error');
        return null;
      }
    } catch (fetchError) {
      if (cacheRef?.current) {
        cacheRef.current[cacheKey] = null;
      }

      console.error('Fetch error in ftBalanceOf:', fetchError);
      return null;
    }
  };

  const viewAccessKey = async (
    address: string,
    key: string,
  ): Promise<AccessInfo | null> => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: address,
        finality: 'final',
        public_key: key,
        request_type: 'view_access_key',
      });

      if (statusCode === 200 && data) {
        return data.result as unknown as AccessInfo;
      } else {
        console.error(
          `Error fetching access key for address ${address}:`,
          error,
        );
        return null;
      }
    } catch (fetchError) {
      console.error(
        `Error fetching access key for address ${address}:`,
        fetchError,
      );
      return null;
    }
  };

  const getAccount = async (poolId: string, account_id: string | undefined) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: poolId,
        args_base64: encodeArgs({ account_id }),
        finality: 'optimistic',
        method_name: 'get_account',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        console.error('Error fetching account:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching account:', fetchError);
      return null;
    }
  };

  const getNumberOfAccounts = async (poolId: string) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: poolId,
        args_base64: 'e30=',
        finality: 'optimistic',
        method_name: 'get_number_of_accounts',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        console.error('Error fetching number of accounts:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching number of accounts:', fetchError);
      return null;
    }
  };

  const getAccounts = async (
    poolId: string,
    start: number,
    limit: number,
    setLoading: (loading: boolean) => void,
    setError: (error: boolean) => void,
  ) => {
    setLoading(true);
    setError(false);

    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: poolId,
        args_base64: encodeArgs({ from_index: start, limit: limit }),
        finality: 'optimistic',
        method_name: 'get_accounts',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        setError(true);
        console.error('RPC Error:', error);
        return null;
      }
    } catch (fetchError) {
      setError(true);
      console.error('Error fetching accounts:', fetchError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getValidators = async () => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(
        rpcUrl,
        [null],
        'validators',
      );

      if (statusCode === 200 && data) {
        return data.result;
      } else {
        console.error('Error fetching validators:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching validators:', fetchError);
      return null;
    }
  };
  const getRewardFeeFraction = async (poolId: string) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: poolId,
        args_base64: 'e30=',
        finality: 'optimistic',
        method_name: 'get_reward_fee_fraction',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        console.error('Error fetching reward fee fraction:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching reward fee fraction:', fetchError);
      return null;
    }
  };

  const getFieldsByPool = async (poolId: string) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: 'pool-details.near',
        args_base64: encodeArgs({ pool_id: poolId }),
        finality: 'optimistic',
        method_name: 'get_fields_by_pool',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        console.error('Error fetching fields by pool:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching fields by pool:', fetchError);
      return null;
    }
  };

  const ftMetadata = async (contract: string) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: contract,
        args_base64: '',
        finality: 'final',
        method_name: 'ft_metadata',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : {};
      } else {
        console.error('Error fetching ft metadata:', error);
        return {};
      }
    } catch (fetchError) {
      console.error('Error fetching ft metadata:', fetchError);
      return {};
    }
  };

  const transactionStatus = async (
    hash: string,
    signer: string,
    cacheRef: any,
  ) => {
    const cacheKey = `${hash}_${signer}`;
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    const { data, error, statusCode } = await fetchJsonRpc(
      rpcUrl,
      {
        tx_hash: hash,
        sender_account_id: signer,
        wait_until: 'NONE',
      },
      'EXPERIMENTAL_tx_status',
    );

    if (statusCode === 200) {
      const result = data?.result;
      if (result && result?.final_execution_status !== 'NONE') {
        cacheRef.current[cacheKey] = result;
        return { success: true, data: result, statusCode };
      } else {
        return {
          success: false,
          error: data?.error ?? data?.result,
          statusCode,
        };
      }
    }
    return {
      success: false,
      error: error || data?.error || 'Request failed',
      statusCode,
    };
  };

  const getContractMetadata = async (accountId: string) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: accountId,
        args_base64: '',
        finality: 'optimistic',
        method_name: 'contract_source_metadata',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        console.error('Error fetching contract metadata:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching contract metadata:', fetchError);
      return null;
    }
  };

  const getVerifierData = async (
    accountId: string,
    verifierAccountId: string,
  ) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: verifierAccountId,
        args_base64: encodeArgs({ account_id: accountId }),
        finality: 'optimistic',
        method_name: 'get_contract',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        console.error('Error fetching verifier data:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching verifier data:', fetchError);
      return null;
    }
  };

  return {
    ftBalanceOf,
    ftMetadata,
    getAccount,
    getAccounts,
    getBlockDetails,
    getContractMetadata,
    getFieldsByPool,
    getNumberOfAccounts,
    getRewardFeeFraction,
    getValidators,
    getVerifierData,
    transactionStatus,
    viewAccessKey,
  };
};
export default useRpc;
