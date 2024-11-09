import { baseDecode } from 'borsh';
import { providers } from 'near-api-js';

import { useRpcStore } from '@/stores/rpc';
import { AccessInfo } from '@/utils/types';

import { decodeArgs, encodeArgs } from '../utils/near';

const useRpc = () => {
  const rpcUrl: any = useRpcStore((state) => state.rpc);
  const jsonProviders = [new providers.JsonRpcProvider({ url: rpcUrl })];

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
      account_id: address,
      finality: 'final',
      request_type: 'view_code',
    });

  const viewAccessKeys = async (address: string) =>
    provider.query({
      account_id: address,
      finality: 'final',
      request_type: 'view_access_key_list',
    });

  const viewAccount = async (accountId: string) =>
    provider.query({
      account_id: accountId,
      finality: 'final',
      request_type: 'view_account',
    });

  const ftBalanceOf = async (
    contract: string,
    account_id: string | undefined,
  ) => {
    try {
      const resp = await provider.query({
        account_id: contract,
        args_base64: encodeArgs({ account_id }),
        finality: 'final',
        method_name: 'ft_balance_of',
        request_type: 'call_function',
      });
      const result = (resp as any).result;

      return decodeArgs(result);
    } catch (error) {
      return null;
    }
  };

  const viewAccessKey = async (
    address: string,
    key: string,
  ): Promise<AccessInfo> => {
    const response = await provider.query({
      account_id: address,
      finality: 'final',
      public_key: key,
      request_type: 'view_access_key',
    });
    return response as unknown as AccessInfo;
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

  const transactionStatus = async (hash: any, signer: any) => {
    const decodedHash = baseDecode(hash);
    const uint8ArrayHash = new Uint8Array(decodedHash);
    return provider.txStatusReceipts(uint8ArrayHash, signer, 'NONE');
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
