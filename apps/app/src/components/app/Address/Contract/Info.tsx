'use client';
import { Link } from '@/i18n/routing';
import { convertToUTC, nanoToMilli } from '@/utils/libs';
import { DeploymentsInfo } from '@/utils/types';

import Tooltip from '@/components/app/common/Tooltip';
import Question from '@/components/app/Icons/Question';
import { useAddressRpc } from '../../common/AddressRpcProvider';
import { isEmpty } from 'lodash';

interface Props {
  data: { deployments: DeploymentsInfo[] };
  id: string;
}

const Info = ({ data }: Props) => {
  const deployments = data?.deployments;
  const { contractInfo: contract, isLocked } = useAddressRpc();
  const [createAction, updateAction] = deployments || [];
  const action = updateAction || createAction;

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
        {!isEmpty(deployments) ? (
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
            {isEmpty(deployments) ? (
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
        ) : null}
        {!isEmpty(deployments) ? (
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
        ) : null}

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
          {!contract?.code_base64 ? (
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
          {!contract?.hash ? (
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
