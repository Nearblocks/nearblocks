import { getRequest } from '@/app/utils/api';
import OverviewActions from './OverviewActions';
import { ContractCodeInfo } from '@/app/utils/types';

const Overview = async ({ id, queryParams }: any) => {
  const [data, parse] = await Promise.all([
    getRequest(`account/${id}/contract/deployments`, queryParams),
    getRequest(`account/${id}/contract/parse`),
  ]);

  return (
    <>
      <OverviewActions
        id={id}
        schema={parse?.contract?.[0]?.schema}
        contract={parse?.contract?.[0]?.contract as ContractCodeInfo}
        contractInfo={parse?.contract?.[0]?.contract}
        deployments={data}
      />
    </>
  );
};
export default Overview;
