import { getRequest } from '@/utils/app/api';
import { verifierConfig } from '@/utils/app/config';

import OverviewActions from '@/components/app/Address/Contract/OverviewActions';

const Overview = async ({
  id,
  searchParams,
  contractPromise,
}: {
  id: string;
  searchParams: any;
  contractPromise: Promise<any>;
}) => {
  const data = getRequest(
    `v1/account/${id}/contract/deployments`,
    searchParams,
  );
  const parse = getRequest(`v1/account/${id}/contract/parse`);
  const account = getRequest(`v1/account/${id}`);
  const contractData = await contractPromise;
  const codeHash = contractData?.contract?.[0]?.hash || '';
  const sourceScanPromises = codeHash
    ? verifierConfig.map((config) =>
        getRequest(config.byCodeHashUrl(codeHash), {}, {}, false).catch(
          () => null,
        ),
      )
    : verifierConfig.map(() => Promise.resolve(null));

  const sourceScanData = Promise.all(sourceScanPromises);

  return (
    <OverviewActions
      accountDataPromise={account}
      contractInfoPromise={parse}
      deploymentsPromise={data}
      sourceScanDataPromise={sourceScanData}
    />
  );
};
export default Overview;
