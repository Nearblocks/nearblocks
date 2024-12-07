import React from 'react';

import { Link } from '@/i18n/routing';
import { ContractMetadata, VerificationData } from '@/utils/types';

import ArrowDown from '../../Icons/ArrowDown';
import FaCheckCircle from '../../Icons/FaCheckCircle';
import FaExclamationCircle from '../../Icons/FaExclamationCircle';

type VerificationStatusProps = {
  accountId: string | undefined;
  contractMetadata: ContractMetadata | null;
  selectedVerifier: string;
  setSelectedVerifier: React.Dispatch<React.SetStateAction<string>>;
  statusLoading: boolean;
  verificationData: Record<string, VerificationData>;
  verifiers: string[];
};

const Loader = (props: { className?: string; wrapperClassName?: string }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
    ></div>
  );
};

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  accountId,
  selectedVerifier,
  setSelectedVerifier,
  statusLoading,
  verificationData,
  verifiers,
}) => {
  const handleVerifierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVerifier(e.target.value);
  };

  const verifiedCount = verifiers.filter(
    (verifier) => verificationData[verifier]?.status === 'verified',
  ).length;

  const totalVerifiers = verifiers.length;

  const getVerificationText = () => {
    if (verificationData[selectedVerifier]?.status === 'verified') {
      return 'Contract Source Code Verified';
    } else {
      if (selectedVerifier.includes('v2-verifier.sourcescan')) {
        return (
          <>
            Are you the contract owner?{' '}
            <Link
              className="text-green-500 dark:text-green-250 hover:no-underline"
              href={`/verify-contract?accountId=${accountId}&selectedVerifier=${selectedVerifier}`}
            >
              Verify and Publish
            </Link>{' '}
            your contract source code today!
          </>
        );
      } else return 'Contract Not Verified';
    }
  };

  return statusLoading ? (
    <Loader wrapperClassName="w-full md:w-full my-4 " />
  ) : (
    <div className="flex flex-wrap p-4 w-full">
      {verifiers?.length > 0 && (
        <div className="w-full flex items-center justify-between flex-wrap">
          {selectedVerifier ? (
            <div className="flex items-center">
              {verificationData[selectedVerifier]?.status === 'verified' ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationCircle />
              )}
              <span className="ml-2 font-bold">{getVerificationText()}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="ml-2 font-bold">
                Please Select The Contract Verifier
              </span>
            </div>
          )}
          <div className="flex items-center space-x-4 w-full md:max-w-[350px] ">
            {' '}
            <span className="whitespace-nowrap">
              Verified: {verifiedCount}/{totalVerifiers}
            </span>
            <div className="relative w-full">
              {' '}
              <select
                className="appearance-none w-full h-8 px-2 outline-none rounded bg-white dark:bg-black-600 border dark:border-black-200 text-sm cursor-pointer"
                onChange={handleVerifierChange}
                value={selectedVerifier || ''}
              >
                <option disabled hidden value="">
                  Select Contract Verifier
                </option>
                {verifiers.map((verifier) => (
                  <option
                    className="text-gray-600 dark:text-neargray-10 bg-white dark:bg-black-600"
                    key={verifier}
                    value={verifier}
                  >
                    &nbsp;&nbsp;{verifier}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ArrowDown className="w-4 h-4 fill-current text-gray-500" />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;
