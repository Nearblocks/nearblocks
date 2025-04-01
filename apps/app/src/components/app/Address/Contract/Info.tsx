'use client';
import { useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import { convertToUTC, nanoToMilli } from '@/utils/libs';
import { ContractCodeInfo, DeploymentsInfo } from '@/utils/types';

import Tooltip from '../../common/Tooltip';
import Question from '../../Icons/Question';
import { useRpcStore } from '@/stores/app/rpc';

interface Props {
  data: { deployments: DeploymentsInfo[] };
  id: string;
  isLocked: boolean;
}

const Info = (props: Props) => {
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [rpcError, setRpcError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const { contractCode, viewAccessKeys } = useRpc();
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const switchRpc = useRpcStore((state) => state.switchRpc);
  const { data, id } = props;
  const deployments = data?.deployments;

  const [createAction, updateAction] = deployments || [];
  const action = updateAction || createAction;

  useEffect(() => {
    const loadSchema = async () => {
      if (!id) return;

      try {
        setRpcError(false);
        const [code, keys]: any = await Promise.all([
          contractCode(id as string).catch((error: any) => {
            console.error(`Error fetching contract code for ${id}:`, error);
            return null;
          }),
          viewAccessKeys(id as string).catch((error: any) => {
            console.error(`Error fetching access keys for ${id}:`, error);
            return null;
          }),
        ]);
        if (code && code?.code_base64) {
          setContract({
            block_hash: code.block_hash,
            block_height: code.block_height,
            code_base64: code.code_base64,
            hash: code.hash,
          });
        } else {
          setContract(null);
        }

        const locked = (keys?.keys || []).every(
          (key: {
            access_key: {
              nonce: string;
              permission: string;
            };
            public_key: string;
          }) => key?.access_key.permission !== 'FullAccess',
        );

        setIsLocked(locked);
      } catch (error) {
        // Handle errors appropriately
        setRpcError(true);
        console.error('Error loading schema:', error);
      }
    };

    loadSchema();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rpcUrl]);

  useEffect(() => {
    if (rpcError) {
      switchRpc();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcError]);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  return (
    <div className="w-full mt-3">
      <div className="h-full bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 divide-y dark:divide-black-200 px-1">
        <div className="flex flex-wrap py-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'left-[5.6rem] max-w-[200px] w-40'}
              position="bottom"
              tooltip={'Latest time the contract deployed'}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Last Updated
          </div>
          {!deployments ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xl" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {action?.block_timestamp &&
                convertToUTC(nanoToMilli(action?.block_timestamp), true)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap py-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <Tooltip
              className={'left-28 max-w-[200px] w-80'}
              position="bottom"
              tooltip={`The transaction unique identifier (hash) that the contract is latest deployed.`}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Transaction Hash
          </div>
          {!deployments ? (
            <Loader wrapperClassName="w-32" />
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {action?.transaction_hash && (
                <Link
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  href={`/txns/${action.transaction_hash}`}
                >
                  {action.transaction_hash}
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap py-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <Tooltip
              className={'left-28 max-w-[200px] w-80'}
              position="bottom"
              tooltip={`Locked contract means that there are no access keys allowing the contract code to be re-deployed`}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Contract Locked
          </div>
          {!deployments ? (
            <Loader wrapperClassName="w-32" />
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {contract?.code_base64 && isLocked ? 'Yes' : 'No'}
            </div>
          )}
        </div>

        <div className="flex flex-wrap py-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <Tooltip
              className={'left-28 max-w-[200px] w-80'}
              position="bottom"
              tooltip={`Checksum (SHA-256 in base58 encoding) of the contract binary.`}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Code Hash
          </div>
          {!deployments || !contract ? (
            <Loader wrapperClassName="w-32" />
          ) : (
            <div className="w-full md:w-3/4 break-words">{contract?.hash}</div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Info;
