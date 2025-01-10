import { getRequest } from '@/utils/app/api';

import AccessKeysActions from './AccessKeysActions';

const AccessKeys = async ({ id, searchParams }: any) => {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/keys`, searchParams, options),
    getRequest(`account/${id}/keys/count`, searchParams, options),
  ]);

  return (
    <>
      <AccessKeysActions
        count={count?.keys?.[0]?.count}
        error={!data || data === null}
        id={id}
        keys={data?.keys}
      />
    </>
  );
};
export default AccessKeys;
