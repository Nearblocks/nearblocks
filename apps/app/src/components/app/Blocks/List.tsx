import { getRequest } from '@/utils/app/api';

import ListActions from './ListActions';

const List = async ({ cursor }: { cursor: string }) => {
  const data = await getRequest('blocks', { cursor });
  const dataCount = await getRequest('blocks/count');
  return (
    <ListActions
      apiUrl={'blocks'}
      data={data}
      error={!data}
      totalCount={dataCount}
    />
  );
};
export default List;
