import { getRequest } from '@/utils/app/api';
import MultichainInfoActions from './MultichainInfoActions';

const MultichainInfo = async ({ id }: { id: string }) => {
  const options: RequestInit = { next: { revalidate: 10 } };

  const [multiChainAccountsData] = await Promise.all([
    getRequest(`v1/chain-abstraction/${id}/multi-chain-accounts`, {}, options),
  ]);
  return (
    <MultichainInfoActions
      multiChainAccounts={multiChainAccountsData?.multiChainAccounts}
    />
  );
};

export default MultichainInfo;
