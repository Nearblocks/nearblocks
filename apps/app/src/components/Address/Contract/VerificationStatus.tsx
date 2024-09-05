import ArrowDown from '@/components/Icons/ArrowDown';
import FaCheckCircle from '@/components/Icons/FaCheckCircle';
import FaExclamationCircle from '@/components/Icons/FaExclamationCircle';
import FaTimesCircle from '@/components/Icons/FaTimesCircle';
import { ContractMetadata, VerificationData } from '@/utils/types';
import Link from 'next/link';
import React from 'react';

type VerificationStatusProps = {
  statusLoading: boolean;
  setSelectedVerifier: React.Dispatch<React.SetStateAction<string>>;
  selectedVerifier: string;
  verifiers: string[];
  verificationData: Record<string, VerificationData>;
  contractMetadata: ContractMetadata | null;
};

const Loader = (props: { className?: string; wrapperClassName?: string }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
    ></div>
  );
};

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  statusLoading,
  setSelectedVerifier,
  selectedVerifier,
  verifiers,
  verificationData,
  contractMetadata,
}) => {
  const handleVerifierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVerifier(e.target.value);
  };

  const verifiedCount = verifiers.filter(
    (verifier) => verificationData[verifier]?.status === 'verified',
  ).length;

  const totalVerifiers = verifiers.length;

  return (
    <>
      {statusLoading ? (
        <Loader wrapperClassName="w-full md:w-full my-4 " />
      ) : (
        <div className="flex flex-wrap p-4 ">
          <div className="w-full flex items-center justify-between">
            {selectedVerifier ? (
              <div className="flex items-center">
                {verificationData[selectedVerifier]?.status === 'verified' ? (
                  <FaCheckCircle />
                ) : verificationData[selectedVerifier]?.status ===
                  'mismatch' ? (
                  <FaTimesCircle />
                ) : (
                  <FaExclamationCircle />
                )}
                <span className="ml-2 font-bold">
                  {verificationData[selectedVerifier]?.status === 'verified'
                    ? 'Contract Source Code Verified'
                    : verificationData[selectedVerifier]?.status === 'mismatch'
                    ? 'Contract Source Code Mismatch'
                    : 'Contract Source Code Verification Pending'}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="ml-2 font-bold">
                  Please Select The Contract Verifier
                </span>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <span className="whitespace-nowrap">
                Verified: {verifiedCount}/{totalVerifiers}
              </span>
              <div className="relative flex-shrink-0 w-auto">
                <select
                  value={selectedVerifier || ''}
                  onChange={handleVerifierChange}
                  className="appearance-none w-auto h-8 px-2 outline-none rounded bg-white dark:bg-black-600 border dark:border-black-200 text-sm cursor-pointer"
                >
                  <option value="" disabled hidden>
                    Select Contract Verifier
                  </option>
                  {verifiers.map((verifier) => (
                    <option
                      key={verifier}
                      value={verifier}
                      className="text-gray-600 dark:text-neargray-10 bg-white dark:bg-black-600"
                    >
                      &nbsp;&nbsp;{verifier}{' '}
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </option>
                  ))}
                </select>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ArrowDown className="w-4 h-4 fill-current text-gray-500" />
                </span>
              </div>
            </div>
          </div>

          {verificationData[selectedVerifier]?.status === 'pending' &&
            !contractMetadata?.build_info && (
              <div className="mt-4">
                If you are the contract owner and want your source code to be
                publicly available, please compile it in a reproducible
                environment using cargo-near:{' '}
                <Link
                  href="https://github.com/near/cargo-near"
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/near/cargo-near
                </Link>
              </div>
            )}
          {verificationData[selectedVerifier]?.status === 'mismatch' && (
            <div className="mt-4">
              The contract code hash does not match. The source code snapshot in
              the metadata does not reflect the current state of the contract.
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VerificationStatus;
