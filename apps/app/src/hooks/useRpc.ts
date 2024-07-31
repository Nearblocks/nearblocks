import { useRpcStore } from '@/stores/rpc';
import { providers } from 'near-api-js';
import { decodeArgs, encodeArgs } from '../utils/near';

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

  const viewAccessKey = async (address: string, key: string) =>
    provider.query({
      request_type: 'view_access_key',
      finality: 'final',
      account_id: address,
      public_key: key,
    });

  return {
    getBlockDetails,
    contractCode,
    viewAccessKeys,
    viewAccount,
    ftBalanceOf,
    viewAccessKey,
  };
};
export default useRpc;
