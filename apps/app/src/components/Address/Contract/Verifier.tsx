import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingCircular from '@/components/common/LoadingCircular';
import ArrowDown from '@/components/Icons/ArrowDown';
import FaInbox from '@/components/Icons/FaInbox';
import useRpc from '@/hooks/useRpc';
import { verifierConfig } from '@/utils/config';
import { ContractMetadata } from '@/utils/types';
import React, { useEffect, useState } from 'react';

type ContractFormProps = {
  accountId: string;
  network: string;
  selectedVerifier: string;
};

type OnChainResponse = {
  hash?: string;
};

const Verifier: React.FC<ContractFormProps> = ({
  accountId,
  selectedVerifier,
  network,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractMetadata, setContractMetadata] = useState<ContractMetadata>();
  const [onChainCodeHash, setOnChainCodeHash] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);

  const { contractCode, getContractMetadata, getVerifierData } = useRpc();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const contractMetadataResponse = await getContractMetadata(
          accountId as string,
        );

        const onChainResponse = await contractCode(accountId as string);

        const onChainHash = (onChainResponse as OnChainResponse)?.hash || '';

        setOnChainCodeHash(onChainHash);
        setContractMetadata(contractMetadataResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch contract metadata');
      }
    };
    if (accountId) fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  useEffect(() => {
    const fetchVerifierData = async () => {
      setLoading(true);

      try {
        const verifierResponse = await getVerifierData(
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
  }, [accountId, onChainCodeHash]);

  const allFieldsExist =
    contractMetadata?.build_info?.build_environment &&
    contractMetadata?.build_info?.source_code_snapshot &&
    contractMetadata?.standards &&
    contractMetadata.standards.length > 0;

  const parseGitHubLink = (snapshot: string) => {
    const regex =
      /^(?:git\+https:\/\/github\.com\/([^\/]+\/[^\/]+)\.git\?rev=([a-f0-9]+)|https:\/\/github\.com\/([^\/]+\/[^\/]+)(?:\.git)?(?:\/tree\/([a-f0-9]+))?)$/;

    const match = snapshot.match(regex);

    if (match) {
      const repoPath = match[1] || match[3];
      const commitHash = match[2] || match[4];

      const url = commitHash
        ? `https://github.com/${repoPath}/tree/${commitHash}`
        : `https://github.com/${repoPath}`;

      return { url, text: commitHash };
    }

    return null;
  };

  const parseLink = (link: string) => {
    try {
      const url = new URL(link);

      return {
        url: link,
        text: `${url.hostname}${url.pathname}`,
      };
    } catch {
      return null;
    }
  };

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
        throw new Error('Verifier configuration not found.');
      }

      const verifierApiUrl: string = verifier?.verifierApiUrl || '';

      const response = await fetch(verifierApiUrl, {
        method: 'POST',
        body: JSON.stringify({
          accountId: accountId,
          networkId: network,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
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
      <>
        {/* <div
          className="w-full text-center bg-nearblue dark:bg-gray-950 p-4 text-green dark:text-neargreen-200 text-sm soft-shadow rounded-xl"
          role="alert"
        >
          <p className="font-bold text-sm">
            Important Verification Instructions
          </p>
          <p>
            If you are the contract owner and wish to verify the contract, you
            need to make your source code publicly available. You can compile it
            in a reproducible environment (e.g., Docker) using&nbsp;
            <a
              href="https://github.com/near/cargo-near"
              className="text-green-500 dark:text-green-250 hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              cargo-near
            </a>
            .
          </p>
          <p>This ensures that your contract adheres to NEP standards.</p>
        </div> */}

        {(success !== null || verified) && !error && (
          <div
            className={`w-full flex justify-between text-left border text-sm py-4 px-10 mt-4 soft-shadow rounded-xl ${
              success || verified
                ? 'bg-emerald-50  text-emerald-500 border-emerald-100 dark:bg-emerald-500/[0.25] dark:border-neargreen-200'
                : 'bg-red-50 text-red-500 border-red-100 dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300'
            }`}
          >
            <div className="flex my-auto items-center">
              {verified ? <p>Contract already verified</p> : <p>{message}</p>}
            </div>
          </div>
        )}

        <div className="w-full pt-4 pb-8 px-10 bg-white dark:bg-black-600  mt-4 soft-shadow rounded-xl text-neargray-600 dark:text-neargray-10">
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
                  {loading || apiLoading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <>
                      <input
                        id="standard"
                        value={
                          contractMetadata?.standards
                            ?.map(
                              (standard) =>
                                `${standard.standard}:v${standard.version}`,
                            )
                            .join('&nbsp') || ''
                        }
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                        disabled
                      />
                      {!contractMetadata?.standards && (
                        <p className="text-red-500 text-xs mt-1">
                          Standard is required
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">Contract Address</p>
                  {loading || apiLoading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <input
                      id="address"
                      value={accountId}
                      className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                      disabled
                    />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">Language</p>
                  {loading || apiLoading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <div className="relative">
                      <select
                        id="language"
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-white dark:bg-black-600 dark:text-neargray-10 outline-none cursor-pointer appearance-none"
                      >
                        <option value="rust">Rust</option>
                        <option value="javascript" disabled>
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
                  {loading || apiLoading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <>
                      <input
                        id="buildEnvironment"
                        value={
                          contractMetadata?.build_info?.build_environment || ''
                        }
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                        disabled
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
                  {loading || apiLoading ? (
                    <Loader wrapperClassName="w-full md:w-full px-3 py-1.5 " />
                  ) : (
                    <>
                      <input
                        id="sourceCode"
                        value={getSourceCode() || ''}
                        className="px-3 py-1.5 text-sm border dark:border-black-200  w-full rounded h-10 bg-gray-100 dark:bg-[#252525] dark:text-neargray-10 outline-none"
                        disabled
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
                  type="submit"
                  className={`text-base text-white border border-green-900/10 font-normal px-3 py-1.5 dark:text-neargray-10 rounded w-fit ${
                    allFieldsExist && !verified
                      ? 'hover:bg-green-400 hover:dark:bg-green-200 hover:shadow-md dark:hover:shadow-green-250/50 hover:shadow-green-600/50 bg-green-500 dark:bg-green-250 '
                      : 'disabled:bg-neargray-800 disabled:dark:bg-black-200 disabled:text-nearblue-600 disabled:dark:text-neargray-10 cursor-not-allowed'
                  } `}
                  disabled={
                    loading || apiLoading || !allFieldsExist || verified
                  }
                >
                  {apiLoading ? <LoadingCircular /> : 'Verify Contract'}
                </button>
              </div>
            )}
          </form>
        </div>
      </>
    </div>
  );
};

export default Verifier;
