import { decodeArgs, encodeArgs } from '@/utils/app/near';
import { AccessInfo } from '@/utils/types';
import { BlockResult } from 'near-api-js/lib/providers/provider';
import { NearRpcClient, experimentalTxStatus } from '@near-js/jsonrpc-client';
import { RpcTransactionResponse } from '@near-js/jsonrpc-types';

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
  const getBlockDetails = async (rpcUrl: string, blockId: number | string) => {
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
    rpcUrl: string,
    contract: string,
    account_id?: string,
  ) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        request_type: 'call_function',
        finality: 'final',
        account_id: contract,
        method_name: 'ft_balance_of',
        args_base64: encodeArgs({ account_id: account_id?.toLowerCase() }),
      });
      if (data && statusCode === 200) {
        return data.result?.result ? decodeArgs(data.result.result) : null;
      } else {
        console.error('Error in ftBalanceOf:', error || 'Unknown error');
        return null;
      }
    } catch (fetchError) {
      console.error('Fetch error in ftBalanceOf:', fetchError);
      return null;
    }
  };

  const viewAccessKey = async (
    rpcUrl: string,
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

  const getAccount = async (
    rpcUrl: string,
    poolId: string,
    account_id: string | undefined,
  ) => {
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

  const getNumberOfAccounts = async (rpcUrl: string, poolId: string) => {
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
    rpcUrl: string,
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
        return result ? decodeArgs(result) : [];
      } else {
        setError(true);
        console.error('RPC Error:', error);
        return [];
      }
    } catch (fetchError) {
      setError(true);
      console.error('Error fetching accounts:', fetchError);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getValidators = async (rpcUrl: string) => {
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
  const getRewardFeeFraction = async (rpcUrl: string, poolId: string) => {
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

  const getFieldsByPool = async (rpcUrl: string, poolId: string) => {
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

  const ftMetadata = async (rpcUrl: string, contract: string) => {
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
    rpcUrl: string,
    hash: string,
    signer: string,
    cacheRef: any,
  ) => {
    const cacheKey = `${hash}_${signer}`;
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }
    try {
      const client = new NearRpcClient({
        endpoint: rpcUrl,
      });

      const result: RpcTransactionResponse = await experimentalTxStatus(
        client,
        {
          txHash: hash,
          senderAccountId: signer,
          waitUntil: 'NONE',
        },
      );

      if (result && result.finalExecutionStatus !== 'NONE') {
        const successResult = {
          success: true,
          data: result as RpcTransactionResponse,
          statusCode: 200,
        };

        cacheRef.current[cacheKey] = successResult;

        return successResult;
      } else {
        return {
          success: false,
          error: result || 'Transaction status unknown',
          statusCode: 200,
        };
      }
    } catch (error: any) {
      if (
        error.name === 'REQUEST_VALIDATION_ERROR' ||
        error.code === -32700 ||
        (error.message && error.message.includes('Parse error'))
      ) {
        const notFoundResult = {
          success: false,
          error: 'Transaction not found',
          statusCode: 400,
          isNotFound: true,
          shouldRetry: false,
        };

        cacheRef.current[cacheKey] = notFoundResult;
        return notFoundResult;
      }

      console.error('Error fetching transaction status:', error);
      return {
        success: false,
        error: error.message || 'Request failed',
        statusCode: error.statusCode || 500,
      };
    }
  };

  const getContractMetadata = async (rpcUrl: string, accountId: string) => {
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
    rpcUrl: string,
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

  const getVerifierDataByHash = async (
    rpcUrl: string,
    codeHash: string,
    verifierAccountId: string,
  ) => {
    try {
      const { data, statusCode, error } = await fetchJsonRpc(rpcUrl, {
        account_id: verifierAccountId,
        args_base64: encodeArgs({ code_hash: codeHash }),
        finality: 'optimistic',
        method_name: 'get_contract_by_code_hash',
        request_type: 'call_function',
      });

      if (statusCode === 200 && data) {
        const result = data.result?.result;
        return result ? decodeArgs(result) : null;
      } else {
        console.error('Error fetching verifier data by hash:', error);
        return null;
      }
    } catch (fetchError) {
      console.error('Error fetching verifier data by hash:', fetchError);
      return null;
    }
  };

  const viewMethod = async ({
    args = {},
    contractId,
    method,
    rpcUrl,
  }: {
    args?: object;
    contractId: string;
    method: string;
    rpcUrl: string;
  }) => {
    const { data, error, statusCode } = await fetchJsonRpc(rpcUrl, {
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });
    if (statusCode === 200) {
      const result = data?.result?.result;
      if (result && (result instanceof Uint8Array || Array.isArray(result))) {
        const parsed = JSON.parse(Buffer.from(result).toString());
        return { success: true, data: parsed, statusCode };
      } else {
        return {
          success: false,
          error: data?.result,
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
    getVerifierDataByHash,
    transactionStatus,
    viewAccessKey,
    viewMethod,
  };
};
export default useRpc;
