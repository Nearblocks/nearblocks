import { ErrorBoundary } from 'react-error-boundary';
import { getRequest } from '@/utils/app/api';
import { SpamToken } from '@/utils/types';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import AccountAlerts from './AccountAlerts';
import AccountMoreInfo from './AccountMoreInfo';
import AccountOverview from './AccountOverview';
import MultichainInfo from './MultichainInfo';

export default async function Balance({ id }: { id: string }) {
  const options: RequestInit = { next: { revalidate: 10 } };

  const [
    accountData,
    statsData,
    tokenDetails,
    inventoryData,
    deploymentData,
    nftTokenData,
    multiChainAccountsData,
    syncData,
  ] = await Promise.all([
    getRequest(`account/${id}`, {}, options),
    getRequest('stats', {}, options),
    getRequest(`fts/${id}`, {}, options),
    getRequest(`account/${id}/inventory`, {}, options),
    getRequest(`account/${id}/contract/deployments`, {}, options),
    getRequest(`nfts/${id}`, {}, options),
    getRequest(`chain-abstraction/${id}/multi-chain-accounts`, {}, options),
    getRequest(`sync/status`, {}, options),
  ]);

  const balanceIndexerStatus =
    syncData && syncData?.status?.indexers?.balance?.sync;

  const spamList: SpamToken = await fetch(
    `https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json`,
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error('Failed to parse spam tokens JSON', error);
      return null;
    });

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
      <AccountAlerts accountData={accountData?.account?.[0]} id={id} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ErrorBoundary fallback={errorBoundaryFallback}>
          <AccountOverview
            accountData={accountData?.account?.[0]}
            id={id}
            inventoryData={inventoryData?.inventory}
            spamTokens={spamList}
            statsData={statsData?.stats?.[0]}
            tokenData={tokenDetails?.contracts?.[0]}
            status={balanceIndexerStatus}
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={errorBoundaryFallback}>
          <AccountMoreInfo
            accountData={accountData?.account?.[0]}
            deploymentData={deploymentData?.deployments?.[0]}
            id={id}
            nftTokenData={nftTokenData?.contracts?.[0]}
            tokenData={tokenDetails?.contracts?.[0]}
            status={balanceIndexerStatus}
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={errorBoundaryFallback}>
          <MultichainInfo
            multiChainAccounts={multiChainAccountsData?.multiChainAccounts}
          />
        </ErrorBoundary>
      </div>
    </>
  );
}
