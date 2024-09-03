import { getRequest } from '@/app/utils/api';
import AccessKeysActions from './AccessKeysActions';

const AccessKeys = async ({ id, searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`account/${id}/keys`, searchParams),
    getRequest(`account/${id}/keys/count`, searchParams),
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
