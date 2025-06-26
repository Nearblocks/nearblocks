import { useRpcStore } from '@/stores/app/rpc';
import { decodeArgs, encodeArgs } from '@/utils/app/near';
import { AccessInfo } from '@/utils/types';
import { providers } from 'near-api-js';
import { JsonRpcProvider } from '@near-js/providers';
import { baseEncode, baseDecode } from '@near-js/utils';

const useRpc = () => {
  const rpcUrl = useRpcStore((state) => state.rpc);
  const jsonProviders = [new JsonRpcProvider({ url: rpcUrl })];

  const provider = new providers.FailoverRpcProvider(jsonProviders);

  const getBlockDetails = async (blockId: number | string) => {
    try {
      const block = await provider.block({ blockId });
      return block;
    } catch (error) {
      console.error('Error fetching latest block details:', error);
      return null;
    }
  };

  const contractCode = async (address: string) =>
    provider.query({
      request_type: 'view_code',
      finality: 'final',
      account_id: address?.toLowerCase(),
    });

  const viewAccessKeys = async (address: string) =>
    provider.query({
      request_type: 'view_access_key_list',
      finality: 'final',
      account_id: address?.toLowerCase(),
    });

  const viewAccount = async (accountId: string) =>
    provider.query({
      account_id: accountId?.toLowerCase(),
      finality: 'final',
      request_type: 'view_account',
    });

  const ftBalanceOf = async (
    rpc: string,
    contract: string,
    account_id?: string,
  ) => {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'dontcare',
        jsonrpc: '2.0',
        method: 'query',
        params: {
          request_type: 'call_function',
          finality: 'final',
          account_id: contract,
          method_name: 'ft_balance_of',
          args_base64: encodeArgs({ account_id: account_id?.toLowerCase() }),
        },
      }),
    });

    if (!res.ok)
      return {
        success: false,
        status: res.status,
        error: `HTTP ${res.status}: ${res.statusText}`,
        data: null,
      };

    const data = await res.json();
    if (data.error)
      return {
        success: false,
        status: res.status,
        error: `RPC: ${data.error.message || 'Unknown'}`,
        data: null,
      };

    return {
      success: true,
      status: res.status,
      error: null,
      data: data.result?.result ? decodeArgs(data.result.result) : null,
    };
  };

  const viewAccessKey = async (
    address: string,
    key: string,
  ): Promise<AccessInfo | null> => {
    try {
      const response = await provider.query({
        account_id: address,
        finality: 'final',
        public_key: key,
        request_type: 'view_access_key',
      });
      return response as unknown as AccessInfo;
    } catch (error) {
      console.log(`Error fetching access key for address ${address}:`, error);
      return null; // Return `null` in case of an error
    }
  };

  const getAccount = async (poolId: string, account_id: string | undefined) => {
    try {
      const resp = await provider.query({
        account_id: poolId,
        args_base64: encodeArgs({ account_id }),
        finality: 'optimistic',
        method_name: 'get_account',
        request_type: 'call_function',
      });
      const result = (resp as any).result;
      return decodeArgs(result);
    } catch (error) {
      return null;
    }
  };

  const getNumberOfAccounts = async (poolId: string) => {
    try {
      const resp = await provider.query({
        account_id: poolId,
        args_base64: 'e30=',
        finality: 'optimistic',
        method_name: 'get_number_of_accounts',
        request_type: 'call_function',
      });
      const result = (resp as any).result;
      return decodeArgs(result);
    } catch (error) {
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
      const resp = await provider.query({
        account_id: poolId,
        args_base64: encodeArgs({ from_index: start, limit: limit }),
        finality: 'optimistic',
        method_name: 'get_accounts',
        request_type: 'call_function',
      });
      const result = (resp as any).result;
      setLoading(false);
      return decodeArgs(result);
    } catch (error) {
      setError(true);
      setLoading(false);
      console.error('Error fetching accounts:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getValidators = async () => {
    try {
      const validators = await provider.validators(null);
      return validators;
    } catch (error) {
      console.error('Error fetching validators:', error);
      return null;
    }
  };

  const getRewardFeeFraction = async (poolId: string) => {
    try {
      const resp = await provider.query({
        account_id: poolId,
        args_base64: 'e30=',
        finality: 'optimistic',
        method_name: 'get_reward_fee_fraction',
        request_type: 'call_function',
      });
      const result = (resp as any).result;
      return decodeArgs(result);
    } catch (error) {
      return null;
    }
  };

  const getFieldsByPool = async (poolId: string) => {
    try {
      const resp = await provider.query({
        account_id: 'pool-details.near',
        args_base64: encodeArgs({ pool_id: poolId }),
        finality: 'optimistic',
        method_name: 'get_fields_by_pool',
        request_type: 'call_function',
      });
      const result = (resp as any).result;
      return decodeArgs(result);
    } catch (error) {
      return null;
    }
  };

  const ftMetadata = async (contract: string) => {
    try {
      const resp = (await provider.query({
        account_id: contract,
        args_base64: '',
        finality: 'final',
        method_name: 'ft_metadata',
        request_type: 'call_function',
      })) as any;

      return decodeArgs(resp.result);
    } catch (error) {
      return {};
    }
  };

  type QueryParams = {
    tx_hash: string;
    sender_account_id: string;
    wait_until: string;
  };

  type QueryResponse = {
    data?: any;
    error?: any;
    statusCode: number;
  };

  const callRpcMethodWithStatus = async (
    rpcUrl: string,
    method: string,
    params: QueryParams,
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

  const transactionStatus = async (
    hash: string,
    signer: string,
    cacheRef: any,
    rpc: string,
  ) => {
    const uint8ArrayHash = new Uint8Array(baseDecode(hash));
    const encodedTxHash = baseEncode(uint8ArrayHash);
    const cacheKey = `${hash}_${signer}`;
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    const { data, error, statusCode } = await callRpcMethodWithStatus(
      rpc,
      'EXPERIMENTAL_tx_status',
      {
        tx_hash: encodedTxHash,
        sender_account_id: signer,
        wait_until: 'NONE',
      },
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
      const resp = await provider.query({
        account_id: accountId,
        args_base64: '',
        finality: 'optimistic',
        method_name: 'contract_source_metadata',
        request_type: 'call_function',
      });
      const result = (resp as any).result;
      return decodeArgs(result);
    } catch (error) {
      return null;
    }
  };

  const getVerifierData = async (
    accountId: string,
    verifierAccountId: string,
  ) => {
    try {
      const resp = await provider.query({
        account_id: verifierAccountId,
        args_base64: encodeArgs({ account_id: accountId }),
        finality: 'optimistic',
        method_name: 'get_contract',
        request_type: 'call_function',
      });
      const result = (resp as any).result;
      return decodeArgs(result);
    } catch (error) {
      return null;
    }
  };

  return {
    contractCode,
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
    viewAccessKeys,
    viewAccount,
  };
};
export default useRpc;
