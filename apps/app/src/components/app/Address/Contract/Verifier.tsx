import { getRequest } from '@/utils/app/api';

import VerifierActions from './VerifierActions';

const Verifier = async ({
  accountId,
  selectedVerifier,
  network,
}: {
  accountId: string;
  selectedVerifier: string;
  network: string;
}) => {
  const options: RequestInit = {
    cache: 'no-store',
  };
  const contractPromise = getRequest(
    `v1/account/${accountId}/contract`,
    {},
    options,
  );

  return (
    <VerifierActions
      accountId={accountId}
      network={network}
      selectedVerifier={selectedVerifier}
      contractPromise={contractPromise}
    />
  );
};
export default Verifier;
