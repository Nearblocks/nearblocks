// import dynamic from 'next/dynamic';
import { getRequest } from '@/utils/app/api';
import { ContractCodeInfo } from '@/utils/types';

import OverviewActions from './OverviewActions';

const Overview = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };

  const [data, parse, account] = await Promise.all([
    getRequest(`account/${id}/contract/deployments`, searchParams, options),
    getRequest(`account/${id}/contract/parse`, {}, options),
    getRequest(`account/${id}`, {}, options),
  ]);

  return (
    <>
      <OverviewActions
        accountId={account?.account[0]?.account_id}
        contract={parse?.contract?.[0]?.contract as ContractCodeInfo}
        contractInfo={parse?.contract?.[0]?.contract}
        deployments={data}
        id={id}
        schema={parse?.contract?.[0]?.schema}
      />
    </>
  );
};
export default Overview;
