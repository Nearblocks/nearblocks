import type { IconProps } from '@/types/types';
let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

// @ts-ignore
let initialTheme = Storage.get('theme') || 'light';
// @ts-ignore
let initialRpcUrl = Storage.get('rpcUrl') || '';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem 1rem;

  @media (min-width: 640px) {
    padding: 1.5rem 1.5rem;
  }
`;

const LogoContainer = styled.div`
  @media (min-width: 640px) {
    margin-right: 2.5rem;
  }
  .logo {
    height: 2.25rem;
  }
`;

const RightContent = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 1.25rem;
  height: 2.5rem;
`;
const List = styled.ul`list-style-type: none; display:flex: gap:05.rem;`;
const ListItem = styled.li`
  position: relative;
  display: none;
  list-style-type: none;
  color: rgb(var(--color-text-body));

  @media (min-width: 768px) {
    display: inline-flex;
  }

  &:hover > div {
    display: block;
    z-index: 10;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  &:hover {
    color: rgb(var(--primary-color));
  }
  border: none;
  background-color: transparent;
  .w5 {
    width: 1.25rem;
  }
  .h5 {
    height: 1.25rem;
  }
  .h3 {
    height: 0.75rem;
  }
`;

const Dropdown = styled.div`
  display: none;
  .group:hover .group-hover\:block {
    display: block;
  }
  position: absolute;
  top: 100%;
  right: 0px;
`;

const DropdownList = styled.ul`
  white-space: nowrap;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding-bottom: 1rem;
  --tw-space-y-reverse: 0;
  margin-top: calc(1rem /* 16px */ * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1rem /* 16px */ * var(--tw-space-y-reverse));
  background-color: rgb(var(--color-bg-box));
  border-bottom-right-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color),
    0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  margin-top: 26px;
  min-width: 7rem;

  .linkclass {
    display: flex;
    align-items: center;
    &:hover {
      color: rgb(var(--color-primary));
    }
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    @media (min-width: 768px) {
      padding-left: 0.75rem;
    }
    @media (min-width: 768px) {
      padding-right: 1.5rem;
    }
  }
`;

const DropdownListItem = styled.li`
  font-weight: 500;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  @media (min-width: 768px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  text-decorations: none;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: rgb(var(--color-border-body));
`;

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
      <Container>
        <LogoContainer>
          <Link href="/">
            <Widget<IconProps>
              key="Logo"
              loading={
                <Skeleton className="logo" loading>
                  <></>
                </Skeleton>
              }
              props={{ className: 'logo' }}
              src={`${config_account}/widget/lite.Icons.Logo`}
            />
          </Link>
        </LogoContainer>
        <RightContent>
          <List>
            <ListItem>
              <Button>
                <Widget<IconProps>
                  key="Network"
                  loading={
                    <Skeleton className="w5 h5" loading>
                      <></>
                    </Skeleton>
                  }
                  props={{ className: 'h5' }}
                  src={`${config_account}/widget/lite.Icons.Network`}
                />
                <Widget<IconProps>
                  key="CaretDown"
                  props={{ className: 'h3' }}
                  src={`${config_account}/widget/lite.Icons.CaretDown`}
                />
              </Button>
              <Dropdown>
                <DropdownList>
                  <DropdownListItem>Network</DropdownListItem>
                  <li>
                    <Link
                      className={`linkclass ${
                        context.networkId === 'mainnet' &&
                        'color: rgb(var(--color-primary));'
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
                </DropdownList>
              </Dropdown>
            </ListItem>
            <ListItem>
              <Button>
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
              </Button>
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
            </ListItem>

            <li className="relative group">
              <Button onClick={toggleTheme}>
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
              </Button>
            </li>
            <li className="relative group inline-flex md:hidden">
              <Button onClick={toggleMenu}>
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
              </Button>
            </li>
          </List>
        </RightContent>
      </Container>
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
    </>
  );
};

export default Header;
