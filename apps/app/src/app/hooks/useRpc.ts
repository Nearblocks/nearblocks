import { providers } from 'near-api-js';
import { decodeArgs, encodeArgs } from '../utils/near';
import { baseDecode } from 'borsh';
import { useRpcStore } from '../stores/rpc';
import { AccessInfo } from '../utils/types';

const useRpc = () => {
  const rpcUrl: any = useRpcStore((state) => state.rpc);
  const provider = new providers.JsonRpcProvider(rpcUrl);

  const getBlockDetails = async (blockId: number) => {
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
      account_id: address,
    });

  const viewAccessKeys = async (address: string) =>
    provider.query({
      request_type: 'view_access_key_list',
      finality: 'final',
      account_id: address,
    });

  const viewAccount = async (accountId: string) =>
    provider.query({
      request_type: 'view_account',
      finality: 'final',
      account_id: accountId,
    });

  const ftBalanceOf = async (
    contract: string,
    account_id: string | undefined,
  ) => {
    try {
      const resp = await provider.query({
        request_type: 'call_function',
        finality: 'final',
        account_id: contract,
        method_name: 'ft_balance_of',
        args_base64: encodeArgs({ account_id }),
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
      request_type: 'view_access_key',
      finality: 'final',
      account_id: address,
      public_key: key,
    });
    return response as unknown as AccessInfo;
  };

  const getAccount = async (poolId: string, account_id: string | undefined) => {
    try {
      const resp = await provider.query({
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: poolId,
        method_name: 'get_account',
        args_base64: encodeArgs({ account_id }),
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
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: poolId,
        method_name: 'get_number_of_accounts',
        args_base64: 'e30=',
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
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: poolId,
        method_name: 'get_accounts',
        args_base64: encodeArgs({ from_index: start, limit: limit }),
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
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: poolId,
        method_name: 'get_reward_fee_fraction',
        args_base64: 'e30=',
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
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: 'pool-details.near',
        method_name: 'get_fields_by_pool',
        args_base64: encodeArgs({ pool_id: poolId }),
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
        request_type: 'call_function',
        finality: 'final',
        account_id: contract,
        method_name: 'ft_metadata',
        args_base64: '',
      })) as any;

      return decodeArgs(resp.result);
    } catch (error) {
      return {};
    }
  };

  const transactionStatus = async (hash: any, signer: any) =>
    provider.txStatusReceipts(baseDecode(hash), signer);

  return {
    getBlockDetails,
    contractCode,
    viewAccessKeys,
    viewAccount,
    ftBalanceOf,
    viewAccessKey,
    getAccount,
    getAccounts,
    getNumberOfAccounts,
    getValidators,
    getRewardFeeFraction,
    getFieldsByPool,
    ftMetadata,
    transactionStatus,
  };
};
export default useRpc;
