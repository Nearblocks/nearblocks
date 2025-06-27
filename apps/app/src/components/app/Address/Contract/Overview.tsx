import { getRequest } from '@/utils/app/api';

import OverviewActions from '@/components/app/Address/Contract/OverviewActions';

const Overview = async ({ id, searchParams }: any) => {
  const data = getRequest(
    `v1/account/${id}/contract/deployments`,
    searchParams,
  );
  const parse = getRequest(`v1/account/${id}/contract/parse`);
  const account = getRequest(`v1/account/${id}`);

  return (
    <OverviewActions
      accountDataPromise={account}
      contractInfoPromise={parse}
      deploymentsPromise={data}
    />
  );
};
export default Overview;
