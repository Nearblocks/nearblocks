/**
 * Component: ContractInfo
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of specific Contract on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The account identifier passed as a string.
 * @param {ContractInfo} [contract] - Object containing information about the associated contract.
 * @param {string} ownerId - The identifier of the owner of the component.
 * @param {boolean} [isLocked] - Boolean indicating whether the account or contract with full access key or not.
 */

interface Props {
  ownerId: string;
  network: string;
  id: string;
  contract: ContractCodeInfo;
  isLocked: boolean;
}

import Question from '@/includes/icons/Question';
import { ContractCodeInfo, DeploymentsInfo } from '@/includes/types';

export default function (props: Props) {
  const { network, id, contract, ownerId, isLocked } = props;

  const { convertToUTC } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit, nanoToMilli } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [deploymentData, setDeploymentData] = useState<DeploymentsInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const config = getConfig && getConfig(network);

  useEffect(() => {
    function fetchContractData() {
      setLoading(true);
      asyncFetch(`${config?.backendUrl}account/${id}/contract/deployments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              deployments: DeploymentsInfo[];
            };
            status: number;
          }) => {
            if (data?.status === 200) {
              const depResp = data?.body?.deployments;
              setDeploymentData(depResp);
              setLoading(false);
            } else {
              handleRateLimit(data, fetchContractData, () => setLoading(false));
            }
          },
        )
        .catch(() => {});
    }
    if (config?.backendUrl) {
      fetchContractData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id]);

  const [createAction, updateAction] = deploymentData || [];

  const action = updateAction || createAction;

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  return (
    <div className="w-full border-t dark:border-black-200">
      <div className="h-full bg-white dark:bg-black-600 text-sm text-gray-500 dark:text-neargray-10">
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  Latest time the contract deployed.
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            Last Updated
          </div>
          {loading ? (
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
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  The transaction unique identifier (hash) that the contract is
                  latest deployed.
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            Transaction Hash
          </div>
          {loading ? (
            <Loader wrapperClassName="w-32" />
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {action?.transaction_hash && (
                <Link
                  href={`/txns/${action.transaction_hash}`}
                  className="hover:no-underline"
                >
                  <a className="text-green-500 dark:text-green-250 hover:no-underline">
                    {action.transaction_hash}
                  </a>
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  Locked contract means that there are no access keys allowing
                  the contract code to be re-deployed
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            Contract Locked
          </div>
          {loading ? (
            <Loader wrapperClassName="w-32" />
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {contract?.code_base64 && isLocked ? 'Yes' : 'No'}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 ">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  Checksum (SHA-256 in base58 encoding) of the contract binary.
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            Code Hash
          </div>
          {loading ? (
            <Loader wrapperClassName="w-32" />
          ) : (
            <div className="w-full md:w-3/4 break-words">{contract?.hash}</div>
          )}
        </div>
      </div>
    </div>
  );
}
