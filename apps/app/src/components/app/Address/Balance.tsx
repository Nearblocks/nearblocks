import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import AccountAlerts from '@/components/app/Address/AccountAlerts';
import AccountMoreInfo from '@/components/app/Address/AccountMoreInfo';
import AccountOverview from '@/components/app/Address/AccountOverview';
import {
  MoreInfoCardSkeleton,
  OverviewCardSkeleton,
} from '@/components/app/skeleton/address/balance';
/* import MultichainInfo from './MultichainInfo'; */

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

  return (
    <>
      <ErrorBoundary fallback={<div />}>
        <Suspense fallback={null}>
          <AccountAlerts id={id} />
        </Suspense>
      </ErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ErrorBoundary fallback={errorBoundaryFallback}>
          <Suspense fallback={<OverviewCardSkeleton />}>
            <AccountOverview id={id} />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={errorBoundaryFallback}>
          <Suspense fallback={<MoreInfoCardSkeleton />}>
            <AccountMoreInfo id={id} />
          </Suspense>
        </ErrorBoundary>

        {/*  <ErrorBoundary fallback={errorBoundaryFallback}>
          <MultichainInfo id={id} />
        </ErrorBoundary> */}
      </div>
    </>
  );
}
