import Question from '@/components/Icons/Question';
import useRpc from '@/hooks/useRpc';
import { Tooltip } from '@reach/tooltip';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import VerifiedData from './VerifiedData';
import VerificationStatus from './VerificationStatus';
import {
  ContractMetadata,
  VerificationData,
  VerifierData,
  VerifierStatus,
} from '@/utils/types';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';
import { verifierConfig } from '@/utils/config';

type OnChainResponse = {
  hash?: string;
};

type ContractData = {
  onChainCodeHash: string;
  contractMetadata: ContractMetadata | null;
};

type ContractCodeProps = {
  accountId: string;
};

const verifiers = verifierConfig.map((config) => config.accountId);

const ContractCode: React.FC<ContractCodeProps> = ({ accountId }) => {
  const [contractData, setContractData] = useState<ContractData>({
    onChainCodeHash: '',
    contractMetadata: null,
  });
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contractCode, getContractMetadata, getVerifierData } = useRpc();
  const [verificationData, setVerificationData] = useState<
    Record<string, VerificationData>
  >({});

  const [selectedVerifier, setSelectedVerifier] = useState<string>(
    verifiers[0],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatusLoading(true);
        setError(null);

        const contractMetadataResponse = await getContractMetadata(
          accountId as string,
        );

        const onChainResponse = await contractCode(accountId as string);

        const onChainHash = (onChainResponse as OnChainResponse)?.hash || '';

        setContractData({
          onChainCodeHash: onChainHash,
          contractMetadata: contractMetadataResponse,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch contract data');
      }
    };
    if (accountId) fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  useEffect(() => {
    const fetchVerifierData = async () => {
      setStatusLoading(true);

      try {
        const verifierDataPromises = verifiers.map((verifierAccountId) =>
          getVerifierData(accountId as string, verifierAccountId),
        );

        const verifierResponses = await Promise.all(verifierDataPromises);

        const verificationData = verifiers.reduce<
          Record<string, VerificationData>
        >((acc, verifier, index) => {
          const data = verifierResponses[index];
          let status: VerifierStatus = 'pending';

          if (
            data &&
            contractData?.onChainCodeHash &&
            contractData?.contractMetadata
          ) {
            const hashMatches =
              contractData?.onChainCodeHash === data.code_hash;
            status = hashMatches
              ? 'verified'
              : contractData?.contractMetadata?.build_info
              ? 'mismatch'
              : 'pending';
          }

          acc[verifier] = {
            status,
            data,
          };
          return acc;
        }, {});
        setVerificationData(verificationData);
      } catch (error) {
        console.error('Error fetching or updating verifier data:', error);
        setError('Failed to fetch verifier data');
      } finally {
        setStatusLoading(false);
      }
    };
    if (contractData.onChainCodeHash) fetchVerifierData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, contractData]);

  const parseLink = (link: string) => {
    try {
      const url = new URL(link);

      return {
        text: `${url.hostname}${url.pathname}`,
        url: link,
      };
    } catch {
      return { text: 'Invalid URL', url: link };
    }
  };

  const parseBuildEnvironment = (buildEnvironment: string) => {
    const [text] = buildEnvironment.split('@');

    return text;
  };

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  return (
    <div className="w-full mt-3">
      <div className="h-full bg-white dark:bg-black-600 text-sm text-gray-500 dark:text-neargray-10 divide-y dark:divide-black-200">
        {error && (
          <ErrorMessage
            icons={<FaInbox />}
            message={error}
            mutedText="Please try again later"
          />
        )}
        {(verificationData[selectedVerifier]?.status === 'verified' ||
          verificationData[selectedVerifier]?.status === 'pending' ||
          verifiers.length === 0) &&
          contractData?.contractMetadata &&
          !error && (
            <div className="flex flex-wrap">
              <div className="w-full lg:w-1/2 px-2">
                <div className="flex flex-wrap p-4">
                  <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                    <Tooltip
                      label={'Contract version'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Version
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {!contractData?.contractMetadata ? (
                      <Loader wrapperClassName="w-full" />
                    ) : contractData?.contractMetadata?.version ? (
                      contractData?.contractMetadata?.version
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>

                <div className="flex items-start flex-wrap p-4">
                  <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                    <Tooltip
                      label={'Standards used by the contract'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Standards
                  </div>
                  <div className="w-full md:w-3/4 break-words space-y-3">
                    {!contractData?.contractMetadata ? (
                      <Loader wrapperClassName="w-full" />
                    ) : contractData?.contractMetadata?.standards &&
                      contractData?.contractMetadata?.standards?.length > 0 ? (
                      contractData?.contractMetadata?.standards?.map(
                        (std, index) => (
                          <div key={index}>
                            {std.standard}:v{std.version}
                          </div>
                        ),
                      )
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>

                <div className="flex items-start flex-wrap p-4">
                  <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                    <Tooltip
                      label={
                        'Snapshot of the source code used for the contract'
                      }
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Source Code Snapshot
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {!contractData?.contractMetadata ? (
                      <Loader wrapperClassName="w-full" />
                    ) : contractData?.contractMetadata?.link ? (
                      <Link
                        href={contractData?.contractMetadata?.link}
                        className="text-green-500 dark:text-green-250 hover:no-underline break-words"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {parseLink(contractData?.contractMetadata?.link).text}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 px-2">
                <div className="flex flex-wrap p-4">
                  <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                    <Tooltip
                      label={'The environment in which the contract was built'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Build Environment
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {!contractData?.contractMetadata ? (
                      <Loader wrapperClassName="w-full" />
                    ) : contractData?.contractMetadata?.build_info
                        ?.build_environment ? (
                      parseBuildEnvironment(
                        contractData?.contractMetadata?.build_info
                          ?.build_environment,
                      )
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>

                <div className="flex items-start flex-wrap p-4">
                  <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                    <Tooltip
                      label={'Build commands used to compile the contract'}
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                    >
                      <div>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </div>
                    </Tooltip>
                    Build Command
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {!contractData?.contractMetadata ? (
                      <Loader wrapperClassName="w-full" />
                    ) : (
                      <textarea
                        readOnly
                        rows={3}
                        value={
                          contractData?.contractMetadata?.build_info
                            ?.build_command?.length &&
                          contractData?.contractMetadata?.build_info
                            ?.build_command?.length > 0
                            ? contractData?.contractMetadata.build_info.build_command.join(
                                ' ',
                              )
                            : 'N/A'
                        }
                        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 pt-0 px-2 flex-1 resize-y"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        {!error &&
          !(verifiers?.length === 0 && contractData?.contractMetadata) && (
            <div>
              <VerificationStatus
                statusLoading={statusLoading}
                setSelectedVerifier={setSelectedVerifier}
                selectedVerifier={selectedVerifier}
                verifiers={verifiers}
                verificationData={verificationData}
                contractMetadata={contractData?.contractMetadata}
              />

              {!statusLoading &&
                verificationData[selectedVerifier]?.status === 'verified' && (
                  <VerifiedData
                    verifierData={
                      verificationData[selectedVerifier]?.data as VerifierData
                    }
                    selectedVerifier={selectedVerifier}
                  />
                )}
            </div>
          )}
      </div>
    </div>
  );
};

export default ContractCode;
