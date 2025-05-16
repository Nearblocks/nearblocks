import { getRequest } from '@/utils/app/api';

import AccessKeysActions from '@/components/app/Address/AccessKeysActions';

const AccessKeys = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const [data, count] = await Promise.all([
    getRequest(`v1/account/${id}/keys`, searchParams, options),
    getRequest(`v1/account/${id}/keys/count`, searchParams, options),
  ]);

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return (
    <AccessKeysActions
      count={count?.keys?.[0]?.count}
      error={!data || data === null}
      keys={data?.keys}
    />
  );
};
export default AccessKeys;
