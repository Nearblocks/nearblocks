/**
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {boolean} [isHeader] - If the component is part of a header, apply alternate styles.
 * @param {{ push: (path: string) => void }} router - An object with a `push` function for routing purposes.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  isHeader?: boolean;
  router: { push: (path: string) => void };
  networkUrl: string;
}

import SearchIcon from '@/includes/icons/SearchIcon';
import ArrowDown from '@/includes/icons/ArrowDown';
import { search } from '@/includes/search';
import { SearchResult } from '@/includes/types';
import ErrorIcon from '@/includes/icons/ErrorIcon';
import ToastMessage from '@/includes/Common/ToastMessage';

export default function SearchBar({
  isHeader,
  t,
  network,
  router,
  ownerId,
  networkUrl,
}: Props) {
  const { localFormat, shortenHex } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { debounce, getConfig, shortenAddress } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<SearchResult>({} as SearchResult);
  const [filter, setFilter] = useState('all');
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const config = getConfig && getConfig(network);

  // Determine whether to show search results
  const showResults =
    (result?.blocks && result.blocks.length > 0) ||
    (result?.txns && result.txns.length > 0) ||
    (result?.accounts && result.accounts.length > 0) ||
    (result?.receipts && result.receipts.length > 0);
  const showSearchResults = () => {
    setIsResultsVisible(true);
  };

  const hideSearchResults = () => {
    setIsResultsVisible(false);
  };

  const SearchToast = () => {
    return (
      <div className="flex items-center">
        <div className="text-red-500 ">
          <ErrorIcon className=" mr-2 h-5 w-5" />
        </div>
        <Toast.Title className="text-nearblue-700">
          No results. Try on
        </Toast.Title>
        <Toast.Description asChild>
          <a
            href={networkUrl}
            className="text-green-500 dark:text-green-250 ml-2"
          >
            {network === 'mainnet' ? 'Testnet' : 'Mainnet'}
          </a>
        </Toast.Description>
      </div>
    );
  };
  useEffect(() => {
    const time = setTimeout(() => {
      if (showToast) {
        setShowToast(false);
      }
    }, 3000);
    return () => clearTimeout(time);
  }, [showToast]);
  const redirect = (route: any) => {
    switch (route?.type) {
      case 'block':
        return `/blocks/${route?.path}`;
      case 'txn':
        return `/txns/${route?.path}`;
      case 'receipt':
        return `/txns/${route?.path}`;
      case 'address':
        return `/address/${route?.path}`;
      default:
        return null;
    }
  };

  const fetchData = useCallback(
    (keyword: string, filter: string) => {
      if (filter && keyword && config.backendUrl) {
        search(keyword, filter, false, config.backendUrl).then((data: any) => {
          setResult(data || {});
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.backendUrl, filter],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetKeyword = useCallback(
    debounce
      ? debounce(500, (value: string) => {
          fetchData(value, filter);
        })
      : (value: string) => fetchData(value, filter),

    [fetchData],
  );
  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNextValue = event.target.value.replace(/[\s,]/g, '') as string;
    debouncedSetKeyword(newNextValue);
    setKeyword(newNextValue);
    showSearchResults();
  };

  const onSubmit = () => {
    if (filter && keyword && config.backendUrl) {
      search(keyword, filter, true, config.backendUrl).then((data: any) => {
        hideSearchResults();
        const redirectPath = redirect(data);
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          setShowToast(true);
        }
      });
    }
  };
  const onSelect = () => {
    hideSearchResults();
  };

  // Handle filter change
  const onFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
    if (keyword && config.backendUrl) {
      fetchData(keyword, event.target.value);
    }
  };
  return (
    <>
      {showToast && <ToastMessage content={<SearchToast />} />}
      <div className="flex flex-grow">
        <div className={`flex w-full ${isHeader ? 'h-11' : 'h-12'}`}>
          <label className="relative hidden md:flex">
            <select
              className={`h-full block text-sm text-nearblue-600 ${
                isHeader
                  ? 'bg-blue-900/[0.05] dark:bg-black dark:text-neargray-10'
                  : 'bg-gray-100 dark:bg-black-500 dark:text-neargray-10'
              }  pl-4 pr-9  cursor-pointer focus:outline-none appearance-none rounded-none rounded-l-lg border  dark:border-black-200 dark:text-neargray-10	`}
              value={filter}
              onChange={onFilter}
            >
              <option value="all">
                {t ? t('common:search.filters.all') : 'All filters'}
              </option>
              <option value="txns">
                {t ? t('common:search.filters.txns') : 'Txns'}
              </option>
              <option value="blocks">
                {t ? t('common:search.filters.blocks') : 'Blocks'}
              </option>
              <option value="accounts">
                {t ? t('common:search.filters.addresses') : 'Addresses'}
              </option>
            </select>
            <ArrowDown className="absolute right-3 top-3.5 w-4 h-4 fill-current text-nearblue-600 dark:text-neargray-10 pointer-events-none" />
          </label>
          <div className="flex-grow">
            <input
              placeholder={
                t
                  ? t('common:search.placeholder')
                  : 'Search by Account ID / Txn Hash / Block'
              }
              className="search bg-white dark:bg-black-600 dark:text-neargray-10 w-full h-full text-sm px-4 py-3 outline-none dark:border-black-200 border-l border-t border-b md:border-l-0 rounded-l-lg rounded-r-none md:rounded-l-none"
              autoCapitalize="off"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSubmit();
                }
              }}
            />
            {isResultsVisible && showResults && (
              <div className="z-50 relative dark:bg-black-600">
                <div className="text-xs rounded-b-lg  bg-gray-50 py-2 shadow border dark:border-black-200 dark:bg-black-600">
                  {result?.accounts && result.accounts.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                        {t ? t('common:search.list.address') : 'Account'}
                      </h3>
                      {result.accounts.map((address) => (
                        <Link
                          href={`/address/${address.account_id}`}
                          className="hover:no-underline"
                          key={address.account_id}
                        >
                          <div
                            className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 cursor-pointer rounded hover:border-gray-500 truncate"
                            onClick={onSelect}
                          >
                            {shortenAddress(address.account_id)}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {result?.txns && result.txns.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                        {t ? t('common:search.list.txns') : 'Txns'}
                      </h3>
                      {result.txns.map((txn) => (
                        <Link
                          className="hover:no-underline"
                          href={`/txns/${txn.transaction_hash}`}
                          key={txn.transaction_hash}
                        >
                          <div
                            className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate"
                            onClick={onSelect}
                          >
                            {shortenHex(txn.transaction_hash)}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {result?.receipts && result.receipts.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                        Receipts
                      </h3>
                      {result.receipts.map((receipt) => (
                        <Link
                          href={`/txns/${receipt.originated_from_transaction_hash}`}
                          className="hover:no-underline"
                          key={receipt.receipt_id}
                        >
                          <div
                            className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate"
                            onClick={onSelect}
                          >
                            {shortenHex(receipt.receipt_id)}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {result?.blocks && result.blocks.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                        {t ? t('common:search.list.blocks') : 'Blocks'}
                      </h3>
                      {result.blocks.map((block) => (
                        <Link
                          href={`/blocks/${block.block_hash}`}
                          className="hover:no-underline"
                          key={block.block_hash}
                        >
                          <div
                            className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate"
                            onClick={onSelect}
                          >
                            #
                            {block.block_height
                              ? localFormat(block.block_height)
                              : ''}{' '}
                            (0x
                            {shortenHex(block.block_hash)})
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSubmit()}
            className={`${
              isHeader
                ? 'bg-blue-900/[0.05] dark:bg-black-600'
                : 'bg-gray-100 dark:bg-black-500'
            } rounded-r-lg px-5 outline-none focus:outline-none border dark:border-black-200`}
          >
            <SearchIcon className="text-gray-700 dark:text-gray-100 fill-current " />
          </button>
        </div>
      </div>
    </>
  );
}
