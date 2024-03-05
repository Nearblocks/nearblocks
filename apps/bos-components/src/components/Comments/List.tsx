/**
 * Component: CommentsList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: The component enables users to view a list of comments.
 * @interface Props
 * @param {Object} index - The index options for fetching comments.
 * @param {string} index.action - The action to perform when fetching comments.
 * @param {string} index.key - The key to use when fetching comments.
 * @param {Object} index.options - Additional options for fetching comments.
 * @param {number} index.options.limit - The maximum number of comments to fetch.
 * @param {string} index.options.order - The order in which comments should be fetched (e.g., 'desc' for descending order).
 * @param {boolean} index.options.subscribe - Indicates whether to subscribe to new comments.
 * @param {string} index.options.accountId - The account ID associated with the comments.
 * @param {number} [nextLimit] - The number of additional comments to load when the "Load more" button is clicked.
 * @param {string} [loadMoreText] - The text to display on the "Load more" button.
 * @param {(item: any) => JSX.Element} [renderItem] - A function to render each comment item.
 */

import { CommentItem } from '@/includes/types';

interface Props {
  index: {
    action: string;
    key: string;
    options: {
      limit: number;
      order: string;
      subscribe: boolean;
      accountId: string;
    };
  };
  nextLimit?: number;
  loadMoreText?: string;
  renderItem?: (item: any) => JSX.Element;
}
interface CachedItems {
  [key: string]: JSX.Element;
}
export default function (props: Props) {
  const [cachedItems, setCachedItems] = useState<CachedItems>({});
  const [fetchFrom, setFetchFrom] = useState<boolean | number>(false);
  const [nextFetchFrom, setNextFetchFrom] = useState<number>(0);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [initialNextFetchFrom, setInitialNextFetchFrom] = useState<number>(0);
  const [items, setItems] = useState<CommentItem[] | any>([]);

  const index = JSON.parse(JSON.stringify(props.index));
  if (!index) {
    return 'props.index is not defined';
  }

  const renderItem =
    props.renderItem ??
    ((item: any, _i: number) => (
      <div key={JSON.stringify(item)}>
        #{item.blockHeight}: {JSON.stringify(item)}
      </div>
    ));
  const cachedRenderItem = (item: string, i: number) => {
    const key = JSON.stringify(item);
    if (!(key in cachedItems)) {
      const updatedCachedItems = { ...cachedItems };
      updatedCachedItems[key] = renderItem(item, i);
      setCachedItems(updatedCachedItems);
    }
    return cachedItems[key];
  };

  index.options = index.options || {};
  const initialRenderLimit = index.options.limit ?? 10;
  const addDisplayCount = props.nextLimit ?? initialRenderLimit;

  index.options.limit = Math.min(
    Math.max(
      initialRenderLimit + addDisplayCount * 2,
      index.options.limit ?? 0,
    ),
    100,
  );

  const initialItems = Social.index(index.action, index.key, index.options);
  if (initialItems === null) {
    return '';
  }

  const computeFetchFrom = (items: any, limit: number) => {
    if (!items || items.length < limit) {
      return false;
    }
    const blockHeight = items[items.length - 1].blockHeight;
    return index.options.order === 'desc' ? blockHeight - 1 : blockHeight + 1;
  };

  const mergeItems = (newItems: any) => {
    const Items = [
      ...new Set([...newItems, ...items].map((i) => JSON.stringify(i))),
    ].map((i) => JSON.parse(i));
    Items.sort((a, b) => a.blockHeight - b.blockHeight);
    if (index.options.order === 'desc') {
      Items.reverse();
    }
    return Items;
  };

  if (!fetchFrom) {
    const nextFetchFrom = computeFetchFrom(initialItems, index.options.limit);
    if (nextFetchFrom !== initialNextFetchFrom) {
      setFetchFrom(false);
      setNextFetchFrom(nextFetchFrom);
      setDisplayCount(initialRenderLimit);
      setInitialNextFetchFrom(nextFetchFrom);
      setItems(initialItems);
    } else {
      setItems(mergeItems(initialItems));
    }
  }

  if (fetchFrom) {
    const limit = addDisplayCount;
    const newItems = Social.index(
      index.action,
      index.key,
      Object.assign({}, index.options, {
        from: fetchFrom,
        subscribe: undefined,
        limit,
      }),
    );
    if (newItems !== null) {
      setFetchFrom(false);
      setNextFetchFrom(computeFetchFrom(newItems, limit));
      setItems(mergeItems(newItems));
    }
  }

  const filteredItems = items;

  const maybeFetchMore = () => {
    if (
      filteredItems.length - displayCount < addDisplayCount * 2 &&
      !fetchFrom &&
      nextFetchFrom &&
      nextFetchFrom !== fetchFrom
    ) {
      setFetchFrom(nextFetchFrom);
    }
  };

  maybeFetchMore();

  const makeMoreItems = () => {
    setDisplayCount(displayCount + addDisplayCount);
  };

  const loader = (
    <div className="loader" key={'loader'}>
      <span
        className="spinner-grow spinner-grow-sm me-1"
        role="status"
        aria-hidden="true"
      />
      Loading ...
    </div>
  );
  const fetchMore =
    fetchFrom && filteredItems.length < displayCount
      ? loader
      : displayCount < filteredItems.length && (
          <div key={'loader more'}>
            <a
              className=""
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault && e.preventDefault();
                makeMoreItems();
              }}
            >
              {props.loadMoreText ?? 'Load more...'}
            </a>
          </div>
        );

  const Items = filteredItems ? filteredItems.slice(0, displayCount) : [];

  const renderedItems = Items.map(cachedRenderItem);
  return (
    <>
      {renderedItems.length > 0 ? (
        <>
          {renderedItems}
          <div className="inline-flex justify-center p-2 text-green-500 rounded-full cursor-pointer">
            {fetchMore}
          </div>
        </>
      ) : (
        <p className="px-6 py-4 text-gray-400 text-lg">No comments</p>
      )}
    </>
  );
}
