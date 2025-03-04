import { ErrorBoundary } from 'react-error-boundary';
import { getRequest } from '@/utils/app/api';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import AccountAlerts from './AccountAlerts';
import AccountMoreInfo from './AccountMoreInfo';
import AccountOverview from './AccountOverview';
import MultichainInfo from './MultichainInfo';

export default async function Balance({ id }: { id: string }) {
  const options: RequestInit = { next: { revalidate: 10 } };

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
  return (
    <>
      <AccountAlerts
        accountData={await getRequest(`account/${id}`, {}, options)}
        id={id}
      />
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
