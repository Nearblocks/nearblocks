'use client';
import React, { use, useEffect, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import useRpc from '@/hooks/app/useRpc';
import { useRpcProvider } from '@/components/app/common/RpcContext';
import { parseGitHubLink, parseLink } from '@/utils/libs';
import { ContractCodeInfo, ContractMetadata } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import LoadingCircular from '@/components/app/common/LoadingCircular';
import ArrowDown from '@/components/app/Icons/ArrowDown';
import FaInbox from '@/components/app/Icons/FaInbox';
import FaExternalLinkAlt from '@/components/app/Icons/FaExternalLinkAlt';
import { contractCode } from '@/utils/app/actions';
import { isEmpty } from 'lodash';

type contractData = {
  message: string;
  contract: ContractCodeInfo[];
};

type ContractFormProps = {
  accountId: string;
  network: string;
  selectedVerifier: string;
  contractPromise: Promise<contractData>;
};

type OnChainResponse = {
  hash?: string;
};

const Verifier: React.FC<ContractFormProps> = ({
  accountId,
  network,
  selectedVerifier: propVerifier,
  contractPromise,
}) => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [contractMetadata, setContractMetadata] = useState<ContractMetadata>();
  const [verified, setVerified] = useState<boolean>(false);
  const [rpcError, setRpcError] = useState(false);
  const { verifierConfig } = useConfig();
  const verifiers = verifierConfig.map((config) => config.accountId);
  const [selectedVerifier, setSelectedVerifier] = useState<string>(
    verifiers.includes(propVerifier) ? propVerifier : verifiers[0],
  );
  const contractData = use(contractPromise);
  const contractError =
    contractData?.message === 'Error' || isEmpty(contractData?.contract);
  const contractOnChainHash =
    !contractError && contractData?.contract?.[0]?.hash
      ? contractData?.contract?.[0]?.hash
      : null;
  const [onChainCodeHash, setOnChainCodeHash] = useState<null | string>(
    contractOnChainHash,
  );

  const hasNep330 = contractMetadata?.standards?.some(
    (standard) => standard.standard.toLowerCase() === 'nep330',
  );

  const handleVerifierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVerifier(e.target.value);
  };

  const { rpc, switchRpc } = useRpcProvider();
  const { getContractMetadata, getVerifierData } = useRpc();

  useEffect(() => {
    if (rpcError) {
      switchRpc();
    }
  }, [rpcError, switchRpc]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setRpcError(false);
        setLoading(true);
        setError(null);
        const contractMetadataResponse = await getContractMetadata(
          rpc,
          accountId as string,
        );
        setContractMetadata(contractMetadataResponse);
        if (!contractOnChainHash) {
          const onChainResponse = await contractCode(accountId as string);
          const onChainHash = (onChainResponse as OnChainResponse)?.hash || '';
          setOnChainCodeHash(onChainHash);
        }
      } catch (error) {
        setRpcError(true);
        console.error('Error fetching data:', error);
        setError('Failed to fetch contract data');
      }
    };
    if (accountId && !contractError) fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  useEffect(() => {
    const fetchVerifierData = async () => {
      setLoading(true);

      try {
        const verifierResponse = await getVerifierData(
          rpc,
          accountId as string,
          selectedVerifier,
        );

        if (verifierResponse && onChainCodeHash) {
          setVerified(onChainCodeHash === verifierResponse.code_hash);
        }
      } catch (error) {
        console.error('Error fetching or updating verifier data:', error);
        setError('Failed to fetch verifier data');
      } finally {
        setLoading(false);
      }
    };
    if (onChainCodeHash) fetchVerifierData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, onChainCodeHash, selectedVerifier]);

  const allFieldsExist =
    contractMetadata?.build_info?.build_environment &&
    contractMetadata?.build_info?.source_code_snapshot &&
    contractMetadata?.standards &&
    contractMetadata.standards.length > 0;

  const getSourceCode = () => {
    const snapshot =
      contractMetadata?.build_info?.source_code_snapshot ||
      contractMetadata?.link;

    const parsedLink = snapshot?.includes('github')
      ? parseGitHubLink(snapshot)
      : parseLink(snapshot ?? '');

    return parsedLink ? parsedLink.url : '';
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiLoading(true);
    try {
      const verifier = verifierConfig.find(
        (config) => config.accountId === selectedVerifier,
      );

      if (!verifier) {
        console.error('Verifier configuration not found.');
        setApiLoading(false);
        return;
      }

      const verifierApiUrl = verifier.verifierApiUrl;

      const response = await fetch(verifierApiUrl, {
        body: JSON.stringify({
          accountId: accountId,
          networkId: network,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (response) {
        const result = await response.json();

        if (response?.ok) {
          setMessage(result.message ?? result);
          setSuccess(true);
        } else {
          const jsonStartIndex = result.message.indexOf('{');

          if (jsonStartIndex !== -1) {
            try {
              const jsonString = result.message.substring(jsonStartIndex);
              const jsonPart = JSON.parse(jsonString);
              setMessage(jsonPart.error);
            } catch (e) {}
          } else setMessage(result.message);
          setSuccess(false);
        }
      } else {
        setSuccess(null);
        setError('Failed to fetch data');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setApiLoading(false);
    }
  };

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-10 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  return (
    <div>
      {contractError ? (
        <div
          className="w-full text-center bg-red-50 dark:bg-red-900/20 p-4 text-nearblue-600 dark:text-neargray-10 text-sm soft-shadow rounded-xl border border-red-200 dark:border-red-800"
          role="alert"
        >
          <p className="font-bold text-base">Contract Not Found</p>
          <p className="inline-block text-sm mt-2">
            Unable to retrieve contract information. This contract may not
            exist, may not be deployed, or there might be an issue fetching the
            contract data. Please verify the contract address and try again. If
            you are the contract owner and need assistance, check out the&nbsp;
            <a
              className="text-green-500 dark:text-emerald-500 font-medium hover:no-underline"
              href="https://github.com/SourceScan/verification-guide"
              rel="noopener noreferrer"
              target="_blank"
            >
              Verification Guide
              <FaExternalLinkAlt className="w-3 h-3 ml-1 inline mb-0.5" />
            </a>
            .
          </p>
        </div>
      ) : loading || contractMetadata === undefined ? (
        <div
          className="w-full text-center bg-gray-100 dark:bg-black-600 p-4 soft-shadow rounded-xl border border-gray-200 dark:border-gray-700"
          role="status"
        >
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-black-200 rounded w-48 mx-auto mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-black-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-black-200 rounded w-5/6 mx-auto"></div>
          </div>
        </div>
      ) : contractMetadata === null || hasNep330 === false ? (
        <div
          className="w-full text-center bg-red-50 dark:bg-red-900/20 p-4 text-nearblue-600 dark:text-neargray-10 text-sm soft-shadow rounded-xl border border-red-200 dark:border-red-800"
          role="alert"
        >
          <p className="font-bold text-base">NEP-330 Standard Required</p>
          <p className="inline-block text-sm mt-2">
            This contract cannot be verified as it does not implement the
            NEP-330 standard, which is required for contract source metadata and
            verification. To make your contract verifiable, you need to
            implement the NEP-330 standard and include contract source metadata.
            For detailed instructions on how to add NEP-330 support to your
            contract, check out the
            <a
              className="text-green-500 dark:text-emerald-500 font-medium hover:no-underline mx-1"
              href="https://github.com/near/NEPs/blob/master/neps/nep-0330.md"
              rel="noopener noreferrer"
              target="_blank"
            >
              NEP-330 Documentation
              <FaExternalLinkAlt className="w-3 h-3 ml-1 inline mb-0.5" />
            </a>
            and the
            <a
              className="text-green-500 dark:text-emerald-500 font-medium hover:no-underline mx-1"
              href="https://github.com/SourceScan/verification-guide"
              rel="noopener noreferrer"
              target="_blank"
            >
              Verification Guide
              <FaExternalLinkAlt className="w-3 h-3 ml-1 inline mb-0.5" />
            </a>
            .
          </p>
        </div>
      ) : (
        hasNep330 && (
          <div
            className="w-full text-center bg-nearblue dark:bg-gray-950 p-4 text-nearblue-600 dark:text-neargray-10 text-sm soft-shadow rounded-xl"
            role="alert"
          >
            <p className="font-bold text-base">Verification Instructions</p>
            <p className="inline-block text-sm">
              If you are the contract owner and wish to verify your smart
              contract, you need to make your source code publicly available.
              For detailed instructions, check out the&nbsp;
              <a
                className="text-green-500 dark:text-emerald-500 font-medium hover:no-underline"
                href="https://github.com/SourceScan/verification-guide"
                rel="noopener noreferrer"
                target="_blank"
              >
                Verification Guide
                <FaExternalLinkAlt className="w-3 h-3 ml-1 inline mb-0.5" />
              </a>
              .
            </p>
          </div>
        )
      )}
      {(success !== null || verified) && !error && (
        <div
          className={`w-full flex justify-between text-left text-sm py-4 px-6 mt-4 soft-shadow rounded-xl ${
            success || verified
              ? 'bg-emerald-50  text-emerald-500 border dark:bg-emerald-500/[0.10] dark:border-neargreen-200'
              : 'bg-red-50 text-red-500 border-red-100 dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300'
          }`}
        >
          <div className="flex my-auto items-center">
            {verified ? <p>Contract already verified</p> : <p>{message}</p>}
          </div>
        </div>
      )}

      {!contractError && (
        <div className="w-full py-5 px-6 bg-white dark:bg-black-600  mt-4 soft-shadow rounded-xl text-neargray-600 dark:text-neargray-10">
          <div className="flex flex-col rounded-md mb-4">
            <p className="font-semibold text-sm mb-1">Contract Verifier</p>
            <div className="relative w-full">
              <select
                className="appearance-none w-full h-10 px-3 py-1.5 outline-none rounded bg-white dark:bg-black-600 border dark:border-black-200 text-sm cursor-pointer"
                onChange={handleVerifierChange}
                value={selectedVerifier}
              >
                {verifiers.map((verifier) => (
                  <option
                    className="text-gray-600 dark:text-neargray-10 bg-white dark:bg-black-600"
                    key={verifier}
                    value={verifier}
                  >
                    {verifier}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ArrowDown className="w-4 h-4 fill-current text-gray-500" />
              </span>
            </div>
          </div>
          <form onSubmit={submitForm}>
            {error && (
              <ErrorMessage
                icons={<FaInbox />}
                message={error}
                mutedText="Please try again later"
              />
            )}
            {!error && (
              <div className="flex flex-col rounded-md gap-4">
                <div>
                  <p className="font-semibold text-sm mb-1">Standard</p>
                  {loading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <>
                      <input
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                        disabled
                        id="standard"
                        value={
                          contractMetadata?.standards
                            ?.map(
                              (standard) =>
                                `${standard.standard}:v${standard.version}`,
                            )
                            .join('&nbsp') || ''
                        }
                      />
                      {!hasNep330 && (
                        <p className="text-red-500 text-xs mt-1">
                          Contract needs to be NEP-330 standard for verification
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">Contract Address</p>
                  {loading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <input
                      className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                      disabled
                      id="address"
                      value={accountId}
                    />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">Language</p>
                  {loading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <div className="relative">
                      <select
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-white dark:bg-black-600 dark:text-neargray-10 outline-none cursor-pointer appearance-none"
                        id="language"
                      >
                        <option value="rust">Rust</option>
                        <option disabled value="javascript">
                          JavaScript
                        </option>
                      </select>
                      <ArrowDown className="absolute right-2 top-3 w-4 h-4 fill-current text-gray-500 " />
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">
                    Build Environment
                  </p>
                  {loading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <>
                      <input
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                        disabled
                        id="buildEnvironment"
                        value={
                          contractMetadata?.build_info?.build_environment || ''
                        }
                      />
                      {!contractMetadata?.build_info?.build_environment && (
                        <p className="text-red-500 text-xs mt-1">
                          Build environment is required
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">Source Code</p>
                  {loading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <>
                      <input
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                        disabled
                        id="sourceCode"
                        value={getSourceCode() || ''}
                      />
                      {!contractMetadata?.build_info?.source_code_snapshot && (
                        <p className="text-red-500 text-xs mt-1">
                          Source code is required
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {!error && (
              <div className="w-full max-w-3xl flex justify-center items-center text-center mt-4">
                <button
                  className={`text-base text-white border border-green-900/10 font-normal px-3 py-1.5 dark:text-neargray-10 rounded w-fit ${
                    !loading && allFieldsExist && !verified
                      ? 'hover:bg-green-400 hover:dark:bg-green-200 hover:shadow-md dark:hover:shadow-green-250/50 hover:shadow-green-600/50 bg-green-500 dark:bg-green-250 '
                      : 'disabled:bg-neargray-800 disabled:dark:bg-black-200 disabled:text-nearblue-600 disabled:dark:text-neargray-10 cursor-not-allowed'
                  } `}
                  disabled={
                    loading || apiLoading || !allFieldsExist || verified
                  }
                  type="submit"
                >
                  {apiLoading ? <LoadingCircular /> : 'Verify Contract'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Verifier;
