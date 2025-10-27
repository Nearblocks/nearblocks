import { getRequestBeta } from '@/utils/app/api';

import AccessKeysActions from '@/components/app/Address/AccessKeysActions';

const AccessKeys = async ({ id, searchParams }: any) => {
  const data = getRequestBeta(`v3/accounts/${id}/keys`, searchParams);
  const count = getRequestBeta(`v3/accounts/${id}/keys/count`, searchParams);
  return <AccessKeysActions dataPromise={data} countPromise={count} />;
};
export default AccessKeys;
