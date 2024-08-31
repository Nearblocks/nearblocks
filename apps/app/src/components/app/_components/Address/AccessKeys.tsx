import { getRequest } from '@/app/utils/api';
import AccessKeysActions from './AccessKeysActions';

const AccessKeys = async ({ id, queryParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/keys`, queryParams),
    getRequest(`account/${id}/keys/count`, queryParams),
  ]);

  return (
    <>
      <AccessKeysActions
        keys={data?.keys}
        count={count?.keys?.[0]?.count}
        error={!data || data === null}
      />
    </>
  );
};
export default AccessKeys;
