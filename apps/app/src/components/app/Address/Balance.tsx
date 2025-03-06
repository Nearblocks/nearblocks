import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import AccountAlerts from './AccountAlerts';
import AccountMoreInfo from './AccountMoreInfo';
import AccountOverview from './AccountOverview';
import MultichainInfo from './MultichainInfo';

export default async function Balance({ id }: { id: string }) {
  const errorBoundaryFallback = (
    <div className="w-full">
      <div className="bg-white soft-shadow rounded-xl dark:bg-black-600">
        <ErrorMessage
          icons={<FaInbox />}
          message={''}
          mutedText="Please try again later"
          reset
        />
      </div>
    </div>
  );

  const alertErrorFallback = (
    <div className="container-xxl text-sm dark:text-neargray-10 text-nearblue-600">
      <div>
        <div className="pl-1.5 py-4 min-h-[25px]">
          Unable to check account validity.
        </div>
      </div>
    </div>
  );
  return (
    <>
      <ErrorBoundary fallback={alertErrorFallback}>
        <AccountAlerts id={id} />
      </ErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ErrorBoundary fallback={errorBoundaryFallback}>
          <AccountOverview id={id} />
        </ErrorBoundary>

        <ErrorBoundary fallback={errorBoundaryFallback}>
          <AccountMoreInfo id={id} />
        </ErrorBoundary>

        <ErrorBoundary fallback={errorBoundaryFallback}>
          <MultichainInfo id={id} />
        </ErrorBoundary>
      </div>
    </>
  );
}
