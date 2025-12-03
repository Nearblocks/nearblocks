'use client';

import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const ErrorBoundaryFallback = ({
  resetErrorBoundary,
}: {
  resetErrorBoundary: () => void;
}) => (
  <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-5 w-full">
    <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
      <ErrorMessage
        icons={<FileSlash />}
        message="An error occurred while loading the contract verifier (SourceScan)"
        mutedText="Please try again later"
        errorBg
        reset
        onReset={resetErrorBoundary}
      />
    </div>
  </div>
);

export default function VerifierErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      {children}
    </ErrorBoundary>
  );
}
