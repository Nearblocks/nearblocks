import Question from '@/components/Icons/Question';
import { convertToUTC, nanoToMilli } from '@/utils/libs';
import { ContractCodeInfo, DeploymentsInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import Link from 'next/link';

interface Props {
  contract: ContractCodeInfo;
  isLocked: boolean;
  data: { deployments: DeploymentsInfo[] };
}

const Info = (props: Props) => {
  const { contract, isLocked, data } = props;
  const deployments = data?.deployments;
  const [createAction, updateAction] = deployments || [];
  const action = updateAction || createAction;

  console.log(contract, 's s qs  s');

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  return (
    <div className="w-full border-t dark:border-black-200 mt-3">
      <div className="h-full bg-white dark:bg-black-600 text-sm text-gray-500 dark:text-neargray-10">
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              label={'Latest time the contract deployed.'}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
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
            <div className="w-full md:w-3/4  break-words">
              {action?.block_timestamp &&
                convertToUTC(nanoToMilli(action?.block_timestamp), true)}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <Tooltip
              label={`The transaction unique identifier (hash) that the contract is latest deployed.`}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
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
                  href={`/txns/${action.transaction_hash}`}
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                >
                  {action.transaction_hash}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <Tooltip
              label={`Locked contract means that there are no access keys allowing the contract code to be re-deployed`}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
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
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <Tooltip
              label={`Checksum (SHA-256 in base58 encoding) of the contract binary.`}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
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
