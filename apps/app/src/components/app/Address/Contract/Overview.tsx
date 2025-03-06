import { getRequest } from '@/utils/app/api';
import { ContractCodeInfo } from '@/utils/types';

import OverviewActions from './OverviewActions';

const Overview = async ({ id, searchParams }: any) => {
  const fetchCommonData = async (
    url?: string | undefined,
    searchParams?: any,
  ) => {
    try {
      if (url) {
        const response = await getRequest(url, searchParams);
        return response;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  };

  const [data, parse, account] = await Promise.all([
    fetchCommonData(`account/${id}/contract/deployments`, searchParams),
    fetchCommonData(`account/${id}/contract/parse`),
    fetchCommonData(`account/${id}`),
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
