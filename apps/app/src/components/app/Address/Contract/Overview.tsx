import { getRequest } from '@/utils/app/api';
import { ContractCodeInfo } from '@/utils/types';

import OverviewActions from '@/components/app/Address/Contract/OverviewActions';

const Overview = async ({ id, searchParams }: any) => {
  const options: RequestInit = { next: { revalidate: 10 } };

  const fetchCommonData = async (
    url?: string | undefined,
    searchParams?: any,
  ) => {
    try {
      if (url) {
        const response = await getRequest(url, searchParams, options);
        return response;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  };

  const [data, parse, account] = await Promise.all([
    fetchCommonData(`v1/account/${id}/contract/deployments`, searchParams),
    fetchCommonData(`v1/account/${id}/contract/parse`),
    fetchCommonData(`v1/account/${id}`),
  ]);

  return (
    <>
      <OverviewActions
        accountId={account?.account?.[0]?.account_id}
        contract={parse?.contract?.[0]?.contract as ContractCodeInfo}
        contractInfo={parse?.contract?.[0]?.contract}
        deployments={data}
        schema={parse?.contract?.[0]?.schema}
      />
    </>
  );
};
export default Overview;
