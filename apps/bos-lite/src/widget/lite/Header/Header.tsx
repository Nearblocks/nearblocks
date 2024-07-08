import type { IconProps } from '@/types/types';
let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

// @ts-ignore
let initialTheme = Storage.get('theme') || 'light';
// @ts-ignore
let initialRpcUrl = Storage.get('rpcUrl') || '';
const Header = () => {
  const [showMenu, setMenu] = useState(false);
  const [providers, setProviders] = useState([]);
  const [rpcUrl, setRpc] = useState(initialRpcUrl);
  const [theme, setTheme] = useState(initialTheme);

  const toggleMenu = () => setMenu((show) => !show);
  const setRpcUrl = (rpcUrl: string) => {
    // @ts-ignore
    Storage.set('rpcUrl', rpcUrl);
    setRpc(rpcUrl);
  };
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    // @ts-ignore
    Storage.set('theme', newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const { providers } = VM.require<any>(
      `${config_account}/widget/lite.libs.rpc`,
    );
    setProviders(providers(context.networkId));
    setRpc(initialRpcUrl);
  }, [initialRpcUrl]);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  return (
    <>
      <div className="flex items-center px-4 py-6 sm:px-6">
        <div className="sm:mr-10">
          <Link href="/">
            <Widget<IconProps>
              key="Logo"
              loading={
                <Skeleton className="h-9" loading>
                  <></>
                </Skeleton>
              }
              props={{ className: 'h-9' }}
              src={`${config_account}/widget/lite.Icons.Logo`}
            />
          </Link>
        </div>
        <div className="h-10 flex items-center ml-auto sm:pl-5">
          <ul className="flex space-x-2">
            <li className="relative group hidden md:inline-flex">
              <button className="flex items-center hover:text-primary p-2">
                <Widget<IconProps>
                  key="Network"
                  loading={
                    <Skeleton className="w-5 h-5" loading>
                      <></>
                    </Skeleton>
                  }
                  props={{ className: 'h-5' }}
                  src={`${config_account}/widget/lite.Icons.Network`}
                />
                <Widget<IconProps>
                  key="CaretDown"
                  props={{ className: 'h-3' }}
                  src={`${config_account}/widget/lite.Icons.CaretDown`}
                />
              </button>
              <div className="hidden group-hover:block absolute top-full right-0">
                <ul className="whitespace-nowrap text-sm pb-4 space-y-4 bg-bg-box rounded-b-lg shadow mt-[26px] min-w-28">
                  <li className="font-medium px-6 md:px-4 py-2 border-y border-border-body">
                    Network
                  </li>
                  <li>
                    <Link
                      className={`flex items-center hover:text-primary pl-6 pr-6 md:pl-3 md:pr-6 ${
                        context.networkId === 'mainnet' && 'text-primary'
                      }`}
                      href="https://nearblocks.io"
                    >
                      <span className="w-5">
                        {context.networkId === 'mainnet' && (
                          <Widget<IconProps>
                            key="Logo"
                            props={{ className: 'w-3' }}
                            src={`${config_account}/widget/lite.Icons.Check`}
                          />
                        )}
                      </span>
                      Mainnet
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`flex items-center hover:text-primary pl-6 pr-6 md:pl-3 md:pr-6 ${
                        context.networkId === 'testnet' && 'text-primary'
                      }`}
                      href="https://testnet.nearblocks.io"
                    >
                      <span className="w-5">
                        {context.networkId === 'testnet' && (
                          <Widget<IconProps>
                            key="Logo"
                            props={{ className: 'w-3' }}
                            src={`${config_account}/widget/lite.Icons.Check`}
                          />
                        )}
                      </span>
                      Testnet
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li className="relative group hidden md:inline-flex">
              <button className="flex items-center hover:text-primary p-2">
                <Widget<IconProps>
                  key="Network"
                  loading={
                    <Skeleton className="w-5 h-5" loading>
                      <></>
                    </Skeleton>
                  }
                  props={{ className: 'h-5' }}
                  src={`${config_account}/widget/lite.Icons.Rpc`}
                />
                <Widget<IconProps>
                  key="CaretDown"
                  props={{ className: 'h-3' }}
                  src={`${config_account}/widget/lite.Icons.CaretDown`}
                />
              </button>
              <div className="hidden group-hover:block absolute top-full right-0">
                <ul className="whitespace-nowrap text-sm pb-4 space-y-4 bg-bg-box rounded-b-lg shadow mt-[26px] min-w-28">
                  <li className="font-medium px-6 md:px-4 py-2 border-y border-border-body">
                    RPC
                  </li>
                  {providers.map((provider: any) => (
                    <li key={provider.url}>
                      <button
                        className={`flex items-center hover:text-primary pl-6 pr-6 md:pl-3 md:pr-6 ${
                          rpcUrl === provider.url && 'text-primary'
                        }`}
                        onClick={() => setRpcUrl(provider.url)}
                      >
                        <span className="w-5">
                          {rpcUrl === provider.url && (
                            <Widget<IconProps>
                              key="Logo"
                              loading={
                                <Skeleton className="w-3 h-3" loading>
                                  <></>
                                </Skeleton>
                              }
                              props={{ className: 'w-3' }}
                              src={`${config_account}/widget/lite.Icons.Check`}
                            />
                          )}
                        </span>
                        {provider.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li className="relative group">
              <button
                className="flex items-center hover:text-primary p-2"
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <Widget<IconProps>
                    key="Light"
                    loading={
                      <Skeleton className="w-5 h-5" loading>
                        <></>
                      </Skeleton>
                    }
                    props={{ className: 'h-5' }}
                    src={`${config_account}/widget/lite.Icons.Light`}
                  />
                ) : (
                  <Widget<IconProps>
                    key="Dark"
                    loading={
                      <Skeleton className="w-5 h-5" loading>
                        <></>
                      </Skeleton>
                    }
                    props={{ className: 'h-5' }}
                    src={`${config_account}/widget/lite.Icons.Dark`}
                  />
                )}
              </button>
            </li>
            <li className="relative group inline-flex md:hidden">
              <button
                className="flex items-center hover:text-primary p-2"
                onClick={toggleMenu}
              >
                <Widget<IconProps>
                  key="Settings"
                  loading={
                    <Skeleton className="w-5 h-5" loading>
                      <></>
                    </Skeleton>
                  }
                  props={{ className: 'h-5' }}
                  src={`${config_account}/widget/lite.Icons.Settings`}
                />
              </button>
            </li>
          </ul>
        </div>
      </div>
      {showMenu && (
        <div className="absolute right-0 left-0 z-20 bg-bg-box md:hidden border-b border-border-body shadow-sm">
          <div className="container mx-auto">
            <ul className="whitespace-nowrap text-sm pb-4 space-y-4">
              <li className="font-medium px-6 md:px-4 py-2 border-y border-border-body">
                Network
              </li>
              <li>
                <Link
                  className={`flex items-center hover:text-primary pl-6 pr-6 md:pl-3 md:pr-6 ${
                    context.networkId === 'mainnet' && 'text-primary'
                  }`}
                  href="https://nearblocks.io"
                >
                  <span className="w-5">
                    {context.networkId === 'mainnet' && (
                      <Widget<IconProps>
                        key="Logo"
                        props={{ className: 'w-3' }}
                        src={`${config_account}/widget/lite.Icons.Check`}
                      />
                    )}
                  </span>
                  Mainnet
                </Link>
              </li>
              <li>
                <Link
                  className={`flex items-center hover:text-primary pl-6 pr-6 md:pl-3 md:pr-6 ${
                    context.networkId === 'testnet' && 'text-primary'
                  }`}
                  href="https://testnet.nearblocks.io"
                >
                  <span className="w-5">
                    {context.networkId === 'testnet' && (
                      <Widget<IconProps>
                        key="Logo"
                        props={{ className: 'w-3' }}
                        src={`${config_account}/widget/lite.Icons.Check`}
                      />
                    )}
                  </span>
                  Testnet
                </Link>
              </li>
              <li className="font-medium px-6 md:px-4 py-2 border-y border-border-body">
                RPC
              </li>
              {providers.map((provider: any) => (
                <li key={provider.url}>
                  <button
                    className={`flex items-center hover:text-primary pl-6 pr-6 md:pl-3 md:pr-6 ${
                      rpcUrl === provider.url && 'text-primary'
                    }`}
                    onClick={() => setRpcUrl(provider.url)}
                  >
                    <span className="w-5">
                      {rpcUrl === provider.url && (
                        <Widget<IconProps>
                          key="Logo"
                          props={{ className: 'w-3' }}
                          src={`${config_account}/widget/lite.Icons.Check`}
                        />
                      )}
                    </span>
                    {provider.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <hr />
    </>
  );
};

export default Header;
