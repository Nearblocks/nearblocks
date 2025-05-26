import { getRequest } from '@/utils/app/api';

import AccessKeysActions from '@/components/app/Address/AccessKeysActions';

const AccessKeys = async ({ id, searchParams }: any) => {
  const data = getRequest(`v1/account/${id}/keys`, searchParams);
  const count = getRequest(`v1/account/${id}/keys/count`, searchParams);

  return <AccessKeysActions dataPromise={data} countPromise={count} />;
};
export default AccessKeys;
