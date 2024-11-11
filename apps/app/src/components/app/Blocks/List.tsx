import { getRequest } from '@/utils/app/api';
import ListActions from './ListActions';

const List = async ({ cursor }: { cursor: string }) => {
  const options = {
    cache: 'no-store',
  };
  const data = await getRequest('blocks', { cursor }, options);
  const dataCount = await getRequest('blocks/count', {}, options);

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
