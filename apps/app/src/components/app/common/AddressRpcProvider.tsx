'use client';

import { contractCode, viewAccessKeys, viewAccount } from '@/utils/app/actions';
import { AccountDataInfo, ContractCodeInfo, KeysInfo } from '@/utils/types';
import {
  createContext,
  ReactNode,
  use,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AddressRpcContextType {
  contractInfo: ContractCodeInfo | null;
  accessKeys: KeysInfo[] | null;
  account: AccountDataInfo | null;
  isLocked: boolean | null;
  isLoading: boolean;
}

interface AddressRpcProviderProps {
  children: ReactNode;
  accountId: string | null;
  contractPromise: Promise<contractData>;
}

type contractData = {
  message: string;
  contract: ContractCodeInfo[];
};

const defaultContext: AddressRpcContextType = {
  contractInfo: null,
  accessKeys: null,
  account: null,
  isLocked: null,
  isLoading: true,
};

const AddressRpcContext = createContext<AddressRpcContextType>(defaultContext);

export const AddressRpcProvider: React.FC<AddressRpcProviderProps> = ({
  children,
  accountId,
  contractPromise,
}) => {
  const contractData = use(contractPromise);

  const contractError =
    contractData?.message === 'Error' || !contractData?.contract;
  const contractCodeInfo =
    !contractError && contractData?.contract?.[0]?.code_base64
      ? contractData.contract?.[0]
      : null;

  const lockedInfo = !contractError
    ? contractData?.contract?.length > 0
      ? contractData?.contract?.[0]?.locked
      : null
    : false;

  const [accessKeys, setAccessKeys] = useState<KeysInfo[] | null>(null);
  const [account, setAccount] = useState<AccountDataInfo | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [contractInfo, setContractInfo] = useState<ContractCodeInfo | null>(
    contractCodeInfo,
  );
  const [isLocked, setIsLocked] = useState(lockedInfo);

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [code, keys, acct]: any = await Promise.all([
          contractError && !contractCodeInfo
            ? contractCode(accountId).catch(() => {
                return null;
              })
            : Promise.resolve(null),
          contractError
            ? viewAccessKeys(accountId).catch((error: any) => {
                console.log(
                  `Error fetching access keys for ${accountId}:`,
                  error,
                );
                return null;
              })
            : Promise.resolve(null),
          viewAccount(accountId).catch(() => {
            return null;
          }),
        ]);
        if (contractError && !contractCodeInfo) {
          if (code?.code_base64) {
            setContractInfo((prev) => {
              if (!prev || prev.hash !== code.hash) {
                return {
                  block_hash: code.block_hash,
                  block_height: code.block_height,
                  code_base64: code.code_base64,
                  hash: code.hash,
                  locked: false,
                };
              }
              return prev;
            });
          }
        }
        if (contractError) {
          const locked = (keys?.keys || []).every(
            (key: { access_key: { permission: string } }) =>
              key?.access_key?.permission !== 'FullAccess',
          );
          setIsLocked(locked);
          if (keys?.keys?.length > 0) {
            setAccessKeys((prev) => {
              const isSame = JSON.stringify(prev) === JSON.stringify(keys.keys);
              return isSame ? prev : keys.keys;
            });
          } else if (keys?.keys?.length === 0) {
            setAccessKeys([]);
          }
        }
        if (acct) {
          setAccount((prev) => {
            if (!prev || prev.account_id !== acct.account_id) {
              return acct;
            }
            return prev;
          });
        } else {
          setAccount((prev) => (prev ? null : prev));
        }
      } catch (error) {
        console.error('Error fetching contract details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return (
    <AddressRpcContext.Provider
      value={{
        contractInfo,
        accessKeys,
        account,
        isLocked,
        isLoading,
      }}
    >
      {children}
    </AddressRpcContext.Provider>
  );
};

export const useAddressRpc = (): AddressRpcContextType => {
  const context = useContext(AddressRpcContext);
  if (!context) {
    console.error('useAddressRpc must be used within an AddressRpcProvider');
  }
  return context;
};
