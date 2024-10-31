import { getRequest } from '@/utils/app/api';
import ListActions from './ListActions';

const List = async ({ cursor }: { cursor: string }) => {
  const data = await getRequest('blocks', { cursor });
  const dataCount = await getRequest('blocks/count');
  return (
    <ListActions
      data={data}
      totalCount={dataCount}
      apiUrl={'blocks'}
      error={!data}
    />
  );
};
export default List;
