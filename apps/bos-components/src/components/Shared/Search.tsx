/**
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {boolean} [isHeader] - If the component is part of a header, apply alternate styles.
 * @param {React.FC<{
 *   href: string;
 *   children: React.ReactNode;
 *   className?: string;
 * }>} Link - A React component for rendering links.
 * @param {{ push: (path: string) => void }} router - An object with a `push` function for routing purposes.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  isHeader?: boolean;
  Link: React.FC<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
  router: { push: (path: string) => void };
}

import SearchIcon from '@/includes/icons/SearchIcon';
import ArrowDown from '@/includes/icons/ArrowDown';
import { search } from '@/includes/search';
import { localFormat, shortenHex } from '@/includes/formats';
import { debounce, getConfig, shortenAddress } from '@/includes/libs';
import { SearchResult } from '@/includes/types';

export default function SearchBar({
  isHeader,
  t,
  network,
  Link,
  router,
}: Props) {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<SearchResult>({} as SearchResult);
  const [filter, setFilter] = useState('all');
  const config = getConfig(network);

  // Determine whether to show search results
  const showResults =
    (result?.blocks && result.blocks.length > 0) ||
    (result?.txns && result.txns.length > 0) ||
    (result?.accounts && result.accounts.length > 0) ||
    (result?.receipts && result.receipts.length > 0);

  // Debounced keyword update
  const debouncedSetKeyword = useMemo(
    () => debounce(500, (value: string) => setKeyword(value)),
    [],
  );
  const redirect = (route: any) => {
    switch (route?.type) {
      case 'block':
        return router.push(`/blocks/${route?.path}`);
      case 'txn':
        return router.push(`/txns/${route?.path}`);
      case 'receipt':
        return router.push(`/txns/${route?.path}`);
      case 'address':
        return router.push(`/address/${route?.path}`);
      default:
        return;
    }
  };
  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNextValue = event.target.value.replace(/[\s,]/g, '') as string;
    debouncedSetKeyword(newNextValue);
  };

  const onSubmit = () => {
    if (filter && keyword) {
      search(keyword, filter, true, config.backendUrl).then((data: any) => {
        redirect(data);
      });
    }
  };
  useEffect(() => {
    const fetchData = (keyword: string, filter: string) => {
      if (filter && keyword) {
        search(keyword, filter, false, config.backendUrl).then((data: any) => {
          setResult(data || {});
        });
      }
    };
    fetchData(keyword, filter);
  }, [keyword, filter, config.backendUrl]);
  // Handle filter change
  const onFilter = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setFilter(event.target.value);

  return (
    <>
      <div className="flex flex-grow">
        <div className={`flex w-full ${isHeader ? 'h-11' : 'h-12'}`}>
          <label className="relative hidden md:flex">
            <select
              className={`h-full block text-sm text-nearblue-600 ${
                isHeader ? 'bg-blue-900/[0.05]' : 'bg-gray-100'
              }  pl-4 pr-9  cursor-pointer focus:outline-none appearance-none rounded-none rounded-l-lg border`}
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
            <ArrowDown className="absolute right-3 top-3.5 w-4 h-4 fill-current text-nearblue-600 pointer-events-none" />
          </label>
          <div className="flex-grow">
            <input
              placeholder={
                t
                  ? t('common:search.placeholder')
                  : 'Search by Account ID / Txn Hash / Block'
              }
              className="search bg-white w-full h-full text-sm px-4 py-3 outline-none border-l border-t border-b md:border-l-0 rounded-l-lg rounded-r-none md:rounded-l-none"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSubmit();
                }
              }}
            />
            {showResults && (
              <div className="z-50 relative">
                <div className="text-xs rounded-b-lg  bg-gray-50 py-2 shadow border">
                  {result?.accounts && result.accounts.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 rounded">
                        {t ? t('common:search.list.address') : 'Account'}
                      </h3>
                      {result.accounts.map((address) => (
                        <Link
                          href={`/address/${address.account_id}`}
                          className="hover:no-underline"
                          key={address.account_id}
                        >
                          <div className="mx-2 px-2 py-2 hover:bg-gray-100 cursor-pointer hover:border-gray-500 truncate">
                            {shortenAddress(address.account_id)}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {result?.txns && result.txns.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 rounded">
                        {t ? t('common:search.list.txns') : 'Txns'}
                      </h3>
                      {result.txns.map((txn) => (
                        <Link
                          className="hover:no-underline"
                          href={`/txns/${txn.transaction_hash}`}
                          key={txn.transaction_hash}
                        >
                          <div className="mx-2 px-2 py-2 hover:bg-gray-100 cursor-pointer hover:border-gray-500 truncate">
                            {shortenHex(txn.transaction_hash)}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {result?.receipts && result.receipts.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 rounded">
                        Receipts
                      </h3>
                      {result.receipts.map((receipt) => (
                        <Link
                          href={`/txns/${receipt.originated_from_transaction_hash}`}
                          className="hover:no-underline"
                          key={receipt.receipt_id}
                        >
                          <div className="mx-2 px-2 py-2 hover:bg-gray-100 cursor-pointer hover:border-gray-500 truncate">
                            {shortenHex(receipt.receipt_id)}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {result?.blocks && result.blocks.length > 0 && (
                    <>
                      <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 rounded">
                        {t ? t('common:search.list.blocks') : 'Blocks'}
                      </h3>
                      {result.blocks.map((block) => (
                        <Link
                          href={`/blocks/${block.block_hash}`}
                          className="hover:no-underline"
                          key={block.block_hash}
                        >
                          <div className="mx-2 px-2 py-2 hover:bg-gray-100 cursor-pointer hover:border-gray-500 truncate">
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
              isHeader ? 'bg-blue-900/[0.05]' : 'bg-gray-100'
            } rounded-r-lg px-5 outline-none focus:outline-none border`}
          >
            <SearchIcon className="text-gray-700 fill-current " />
          </button>
        </div>
      </div>
    </>
  );
}
