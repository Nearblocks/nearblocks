import type { FormatterModule } from '@/libs/formatter';
import type { IconProps, SearchResult } from '@/types/types';
type SearchProps = {
  className?: string;
  dropdownClassName?: string;
  router: { push: (path: string) => void };
  rpcUrl: string;
};
const initial = {
  account: undefined,
  block: undefined,
  query: undefined,
  receipt: undefined,
  txn: undefined,
};
// @ts-ignore
let Theme = Storage.get('theme') || 'light';
const config = {
  liteexplorer: '/',
  nearblocks:
    context.networkId === 'testnet'
      ? 'https://testnet.nearblocks.io'
      : 'https://nearblocks.io',
  nearexplorer:
    context.networkId === 'testnet'
      ? 'https://legacy.explorer.testnet.near.org'
      : 'https://legacy.explorer.near.org',
  pikespeakai: context.networkId === 'testnet' ? null : 'https://pikespeak.ai',
};
let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);
const Search = ({
  className,
  dropdownClassName,
  router,
  rpcUrl,
}: SearchProps) => {
  let { debounce, Search } = VM.require<any>(
    `${config_account}/widget/lite.libs.search`,
  );
  let { formatNumber, shortenAddress, shortenHash, yoctoToNear } =
    VM.require<FormatterModule>(`${config_account}/widget/lite.libs.formatter`);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>(initial);

  const fetchData = useCallback(
    (url: string, query: string) => {
      setLoading(true);
      Search(url, query).then((data: any) => {
        setLoading(false);
        setResults(data);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const debouncedSetKeyword = useCallback(
    debounce
      ? debounce(350, (url: string, value: string) => {
          fetchData(url, value);
        })
      : (url: string, value: string) => fetchData(url, value),

    [fetchData, rpcUrl],
  );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // const text = inputRef.current?.value;
    // const query = text?.replace(/[\s,]/g, '');
    const newNextValue = event.target.value.replace(/[\s,]/g, '') as string;
    debouncedSetKeyword(rpcUrl, newNextValue);
    setKeyword(newNextValue);
  };

  const onSubmit = () => {
    if (keyword) {
      Search(keyword).then((resp: any) => {
        if (resp?.account)
          return router.push(`/address/${resp.query.toLowerCase()}`);
        if (resp?.block) return router.push(`/blocks/${resp.query}`);
        if (resp?.txn) return router.push(`/txns/${resp.query}`);
        if (resp?.receipt)
          return router.push(`/txns/${resp.receipt.parent_transaction_hash}`);
      });
    }
  };

  // useEffect(() => {
  //   const onRouteChange = () => inputRef.current?.blur();

  //   router.events.on('routeChangeStart', onRouteChange);

  //   return () => {
  //     router.events.off('routeChangeStart', onRouteChange);
  //   };
  // }, [router]);

  // const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const text = inputRef.current?.value;
  //   const query = text?.replace(/[\s,]/g, '');

  //   const resp = await search(query);

  //   if (resp?.account)
  //     return router.push(`/address/${resp.query.toLowerCase()}`);
  //   if (resp?.block) return router.push(`/blocks/${resp.query}`);
  //   if (resp?.txn) return router.push(`/txns/${resp.query}`);
  //   if (resp?.receipt)
  //     return router.push(`/txns/${resp.receipt.parent_transaction_hash}`);

  //   return;
  // };

  return (
    <div className={` ${className} `}>
      <div className={`relative flex-grow px-5  `}>
        <label className="peer flex items-center flex-grow">
          <Widget<IconProps>
            key="Search"
            props={{ className: 'text-primary h-4' }}
            src={`${config_account}/widget/lite.Icons.Search`}
          />
          <input
            autoCapitalize="off"
            autoComplete="off"
            className="bg-transparent w-full h-9 text-text-input outline-none pl-3"
            id="search"
            // ref={inputRef}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit();
              }
            }}
            placeholder="Find a transaction, account or block"
            type="text"
          />
        </label>
        {results.query && (
          <div className="hidden peer-has-[:focus]:block has-[:active]:block has-[:hover]:block absolute top-full right-0 left-0">
            <ul
              className={`whitespace-nowrap text-sm space-y-4 bg-bg-box shadow pb-6 ${dropdownClassName}`}
            >
              <li className="border-t border-border-body" />
              {loading && (
                <li>
                  <div className="flex items-center h-7 pl-6 pr-6 md:pl-5 md:pr-6">
                    <span className="w-7 inline-flex">
                      <Skeleton loading>
                        <span className="h-5 w-4 inline-flex" />
                      </Skeleton>
                    </span>
                    <Skeleton loading>
                      <span className="h-5 w-40 inline-flex" />
                    </Skeleton>
                  </div>
                </li>
              )}
              {!loading &&
                !results.account &&
                !results.block &&
                !results.txn &&
                !results.receipt && (
                  <li>
                    <div className="flex items-center text-base text-text-input h-7 pl-6 pr-6 md:pl-5 md:pr-6">
                      <span className="w-7">
                        <Widget<IconProps>
                          key="Warning"
                          props={{ className: 'h-4 w-4' }}
                          src={`${config_account}/widget/lite.Icons.Warning`}
                        />
                      </span>
                      No results found
                    </div>
                  </li>
                )}
              {!loading && results.account && (
                <>
                  <li>
                    <Link
                      className="flex items-center justify-between text-lg hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6 text-ellipsis overflow-hidden"
                      href={`/address/${results.query.toLocaleLowerCase()}`}
                    >
                      <span className="flex items-center">
                        <span className="w-7 flex-shrink-0">
                          <Widget<IconProps>
                            key="Address"
                            props={{ className: 'text-primary w-4' }}
                            src={`${config_account}/widget/lite.Icons.Address`}
                          />
                        </span>
                        {shortenAddress(results.query.toLocaleLowerCase())}
                      </span>
                      <span className="text-text-input text-base">
                        {formatNumber(yoctoToNear(results.account.amount), 2)} Ⓝ
                      </span>
                    </Link>
                  </li>
                  <li className="border-t border-border-body pt-2 flex items-center justify-between font-heading font-medium tracking-[0.6px] text-text-body">
                    <a
                      className="flex justify-center w-full"
                      href={`${
                        config.nearblocks
                      }/address/${results.query.toLocaleLowerCase()}`}
                      target="_blank"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        {' '}
                        <img
                          alt="Nearblocks"
                          className="h-10 w-24"
                          src={
                            Theme === 'light'
                              ? 'https://nearblocks.io/images/nearblocksblack.svg'
                              : 'https://nearblocks.io/images/nearblocksblack_dark.svg'
                          }
                        />
                        Nearblocks
                      </div>
                    </a>
                    <div className="border-r border-border-body h-10"></div>
                    <a
                      className="flex justify-center w-full"
                      href={`${
                        config.pikespeakai
                      }/wallet-explorer/${results.query.toLocaleLowerCase()}`}
                      target="_blank"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        {' '}
                        <img
                          alt="Nearblocks"
                          className="h-10 py-2"
                          src={
                            'https://explorer.near.org/images/pikespeak_logo.png'
                          }
                        />
                        Pikespeak
                      </div>
                    </a>
                  </li>
                </>
              )}
              {!loading && results.block && (
                <>
                  <li>
                    <Link
                      className="flex items-center justify-between text-base hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6"
                      href={`/blocks/${results.query}`}
                    >
                      <span className="flex items-center">
                        <span className="w-7 flex-shrink-0">
                          <Widget<IconProps>
                            key="Block"
                            props={{ className: 'text-primary w-4' }}
                            src={`${config_account}/widget/lite.Icons.Block`}
                          />
                        </span>
                        {formatNumber(String(results.block.header.height), 0)}
                      </span>
                      <span className="text-text-input text-base">
                        {shortenHash(results.block.header.hash)}
                      </span>
                    </Link>
                  </li>
                  <li className="border-t border-border-body pt-2 flex items-center justify-between font-heading font-medium tracking-[0.6px] text-text-body">
                    <a
                      className="flex justify-center w-full"
                      href={`${config.nearblocks}/blocks/${results.block.header.hash}`}
                      target="_blank"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        {' '}
                        <img
                          alt="Nearblocks"
                          className="h-10 w-24"
                          src={
                            Theme === 'light'
                              ? 'https://nearblocks.io/images/nearblocksblack.svg'
                              : 'https://nearblocks.io/images/nearblocksblack_dark.svg'
                          }
                        />
                        Nearblocks
                      </div>
                    </a>
                    <div className="border-r border-border-body h-10"></div>
                    <a
                      className="flex justify-center w-full h-full pointer-events-none"
                      href={`${config.pikespeakai}`}
                      target="_blank"
                    >
                      <div className="relative w-full flex flex-col items-center justify-center text-text-warning">
                        <img
                          alt="Nearblocks"
                          className="h-10 py-2"
                          src={
                            'https://explorer.near.org/images/pikespeak_logo.png'
                          }
                        />
                        Pikespeak
                        {/* <div className="absolute top-0 left-0 w-full h-full bg-bg-tooltip !opacity-20 rounded-lg"></div>{' '} */}
                      </div>
                    </a>
                  </li>
                </>
              )}
              {!loading && results.txn && (
                <>
                  <li>
                    <Link
                      className="flex items-center justify-between text-base hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6"
                      href={`/txns/${results.query}`}
                    >
                      <span className="flex items-center">
                        <span className="w-7 flex-shrink-0">
                          <Widget<IconProps>
                            key="Txn"
                            props={{ className: 'text-primary w-4' }}
                            src={`${config_account}/widget/lite.Icons.Txn`}
                          />
                        </span>
                        {shortenHash(results.txn.transaction.hash)}
                      </span>
                    </Link>
                  </li>

                  <li className="border-t border-border-body pt-2 flex items-center justify-between font-heading font-medium tracking-[0.6px] text-text-body">
                    <a
                      className="flex justify-center w-full"
                      href={`${config.nearblocks}/txns/${results.query}`}
                      target="_blank"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        {' '}
                        <img
                          alt="Nearblocks"
                          className="h-10 w-24"
                          src={
                            Theme === 'light'
                              ? 'https://nearblocks.io/images/nearblocksblack.svg'
                              : 'https://nearblocks.io/images/nearblocksblack_dark.svg'
                          }
                        />
                        Nearblocks
                      </div>
                    </a>
                    <div className="border-r border-border-body h-10"></div>
                    <a
                      className="flex justify-center w-full"
                      href={`${config.pikespeakai}/transaction-viewer/${results.query}`}
                      target="_blank"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        {' '}
                        <img
                          alt="Nearblocks"
                          className="h-10 py-2"
                          src={
                            'https://explorer.near.org/images/pikespeak_logo.png'
                          }
                        />
                        Pikespeak
                      </div>
                    </a>
                  </li>
                </>
              )}
              {!loading && results.receipt && (
                <>
                  <li>
                    <Link
                      className="flex items-center justify-between text-base hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6"
                      href={`/txns/${results.receipt.parent_transaction_hash}`}
                    >
                      <span className="flex items-center">
                        <span className="w-7 flex-shrink-0">
                          <Widget<IconProps>
                            key="Txn"
                            props={{ className: 'text-primary w-4' }}
                            src={`${config_account}/widget/lite.Icons.Txn`}
                          />
                        </span>
                        {shortenHash(results.receipt.parent_transaction_hash)}
                      </span>
                    </Link>
                  </li>

                  <li className="border-t border-border-body pt-2 flex items-center justify-between font-heading font-medium tracking-[0.6px] text-text-body">
                    <a
                      className="flex justify-center w-full"
                      href={`${config.nearblocks}/txns/${results.receipt.parent_transaction_hash}`}
                      target="_blank"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        {' '}
                        <img
                          alt="Nearblocks"
                          className="h-10 w-24"
                          src={
                            Theme === 'light'
                              ? 'https://nearblocks.io/images/nearblocksblack.svg'
                              : 'https://nearblocks.io/images/nearblocksblack_dark.svg'
                          }
                        />
                        Nearblocks
                      </div>
                    </a>
                    <div className="border-r border-border-body h-10"></div>
                    <a
                      className="flex justify-center w-full"
                      href={`${config.pikespeakai}/transaction-viewer/${results.receipt.parent_transaction_hash}`}
                      target="_blank"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        {' '}
                        <img
                          alt="Nearblocks"
                          className="h-10 py-2"
                          src={
                            'https://explorer.near.org/images/pikespeak_logo.png'
                          }
                        />
                        Pikespeak
                      </div>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
