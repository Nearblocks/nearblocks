import { getRequest } from '@/utils/app/api';

import AccessKeysActions from './AccessKeysActions';

const AccessKeys = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/keys`, searchParams),
    getRequest(`account/${id}/keys/count`, searchParams),
  ]);

  return (
    <>
      <AccessKeysActions
        count={count?.keys?.[0]?.count}
        error={!data || data === null}
        keys={data?.keys}
      />
    </>
  );
};
export default AccessKeys;
