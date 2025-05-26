import { getRequest } from '@/utils/app/api';
import MultichainInfoActions from '@/components/app/Address/MultichainInfoActions';

const MultichainInfo = async ({ id }: { id: string }) => {
  const [multiChainAccountsData] = await Promise.all([
    getRequest(`v1/chain-abstraction/${id}/multi-chain-accounts`),
  ]);
  return (
    <MultichainInfoActions
      multiChainAccounts={multiChainAccountsData?.multiChainAccounts}
    />
  );
};

export default MultichainInfo;
