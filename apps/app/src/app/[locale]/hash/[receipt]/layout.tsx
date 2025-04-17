import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';

export default async function TxnsLayout(props: {
  children: React.ReactNode;
  params: Promise<{ receipt: string }>;
}) {
  const params = await props.params;
  const { children } = props;
  const { receipt } = params;

  return (
    <ErrorBoundary
      fallback={
        <>
          <div className="container-xxl mx-auto px-5">
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-5">
              <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
                <ErrorMessage
                  icons={<FileSlash />}
                  message="Sorry, we are unable to locate this receipt hash. Please try again later."
                  mutedText={receipt || ''}
                  reset
                />
              </div>
            </div>
          </div>
          <div className="py-8"></div>
        </>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
