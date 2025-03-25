import { getRequest } from '@/utils/app/api';

import ListActions from './ListActions';

const List = async ({ cursor }: { cursor: string }) => {
  const data = await getRequest('v1/blocks', { cursor });
  const dataCount = await getRequest('v1/blocks/count');
  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return <ListActions data={data} error={!data} totalCount={dataCount} />;
};
export default List;
