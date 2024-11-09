import { Tooltip } from '@reach/tooltip';
import { useState } from 'react';

import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';
import Question from '@/components/Icons/Question';
import { Link } from '@/i18n/routing';
import { verifierConfig } from '@/utils/config';
import { parseGitHubLink, parseLink } from '@/utils/libs';
import { ContractData, VerificationData, VerifierData } from '@/utils/types';

import VerificationStatus from './VerificationStatus';
import VerifiedData from './VerifiedData';

type ContractCodeProps = {
  accountId: string;
  contractData: ContractData;
  error: null | string;
  statusLoading: boolean;
  verificationData: Record<string, VerificationData>;
};

const verifiers = verifierConfig.map((config) => config.accountId);

const ContractCode: React.FC<ContractCodeProps> = ({
  accountId,
  contractData,
  error,
  statusLoading,
  verificationData,
}) => {
  const [selectedVerifier, setSelectedVerifier] = useState<string>(
    verifiers[0],
  );

  const parseBuildEnvironment = (buildEnvironment: string) => {
    const [text] = buildEnvironment && buildEnvironment?.split('@');

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
          verifiers?.length === 0) &&
          contractData?.contractMetadata &&
          !error && (
            <div className="flex flex-wrap">
              <div className="w-full lg:w-1/2">
                <div className="flex flex-wrap p-4">
                  <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                    <Tooltip
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                      label={'Contract version'}
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
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                      label={'Standards used by the contract'}
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
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                      label={
                        'Snapshot of the source code used for the contract'
                      }
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
                    ) : contractData?.contractMetadata?.build_info
                        ?.source_code_snapshot ||
                      contractData?.contractMetadata?.link ? (
                      (() => {
                        const snapshot =
                          contractData?.contractMetadata?.link ||
                          contractData?.contractMetadata?.build_info
                            ?.source_code_snapshot;

                        const parsedLink = snapshot?.includes('github')
                          ? parseGitHubLink(snapshot)
                          : parseLink(snapshot ?? '');

                        return parsedLink ? (
                          <Link
                            className="text-green-500 dark:text-green-250 hover:no-underline break-words"
                            href={parsedLink.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {parsedLink.text}
                          </Link>
                        ) : (
                          'N/A'
                        );
                      })()
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 pl-2">
                <div className="flex flex-wrap p-4">
                  <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                    <Tooltip
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                      label={'The environment in which the contract was built'}
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
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                      label={'Build commands used to compile the contract'}
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
                        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 pt-0 px-2 flex-1 resize-y "
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
                accountId={accountId}
                contractMetadata={contractData?.contractMetadata}
                selectedVerifier={selectedVerifier}
                setSelectedVerifier={setSelectedVerifier}
                statusLoading={statusLoading}
                verificationData={verificationData}
                verifiers={verifiers}
              />

              {!statusLoading && (
                <VerifiedData
                  base64Code={contractData.base64Code}
                  selectedVerifier={selectedVerifier}
                  verifierData={
                    verificationData[selectedVerifier]?.data as VerifierData
                  }
                />
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default ContractCode;
