import { getRequest } from '@/utils/app/api';

import ListActions from './ListActions';

const List = async ({ searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`v1/txns`, searchParams),
    getRequest(`v1/txns/count`, searchParams),
  ]);
  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return <ListActions error={!data} txnsCount={count} txnsData={data} />;
};
export default List;
