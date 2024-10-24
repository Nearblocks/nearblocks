import React, { FC, ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
/* import { useDisconnect } from "wagmi"; */
import Loader from '../skeleton/common/Loader';
/* import Logout from "components/Icons/Logout"; */
import useAuth from '@/hooks/useAuth';
import useStorage from '@/hooks/useStorage';
import ActiveLink from '../ActiveLink';
import Home from '../Icons/Home';
import User from '../Icons/User';
import Plan from '../Icons/Plan';
import Menu from '../Icons/Menu';
import Close from '../Icons/Close';
import Campaign from '../Icons/Campaign';
import Create from '../Icons/Create';
import FileSearch from '../Icons/FileSearch';
import Key from '../Icons/Key';
import Arrow from '../Icons/Arrow';
import FaFileInvoiceDollar from '../Icons/FaFileInvoiceDollar';
import UserLogout from './Logout';
import { docsUrl } from '@/utils/config';
import Skeleton from '../skeleton/common/Skeleton';

interface MenuItemProps {
  href: string;
  icon: React.ElementType;
  text: string;
  exact?: boolean | null;
}

const MenuItem: FC<MenuItemProps> = ({
  href,
  icon: Icon,
  text,
  exact = null,
}) => (
  <div className="hover:text-green-800/70 text-gray-600 dark:text-neargray-100 rounded-md cursor-pointer">
    <ActiveLink
      href={href}
      inActiveClassName="py-2 hover:bg-neargreen/5 dark:hover:bg-black-200 dark:hover:text-green-100 rounded-md my-1"
      activeClassName="text-green-800/70 dark:text-green-100 py-2 bg-neargreen/5 dark:bg-black-200 rounded-md my-1"
      exact={exact}
    >
      <span className="flex">
        <Icon className="h-4 w-4 mx-2 hover:text-green-800/70" />
        <p className="text-sm px-1">{text}</p>
      </span>
    </ActiveLink>
  </div>
);

interface UserLayoutProps {
  children: ReactNode;
  title: string;
}

const UserLayout = ({ children, title }: UserLayoutProps) => {
  const [showMenu, setShowMenu] = useState(true);
  const [, _setToken] = useStorage('token');
  const [role, _setRole] = useStorage('role');
  const [, _setUser] = useStorage('user');
  const { data: userData, loading } = useAuth('/profile');
  /*   const { disconnect } = useDisconnect(); */
  const userDetails = userData?.data || null;
  const router = useRouter();

  return (
    <>
      <section>
        <div
          style={{
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
          className="h-60 bg-hero-pattern dark:bg-hero-pattern-dark"
        >
          <div className="xl:container mx-auto pt-10">
            <div className="flex items-center justify-between mr-3">
              <div className="ml-3">
                <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white ">
                  {title}
                </h1>
                <ol
                  vocab="https://schema.org/"
                  typeof="BreadcrumbList"
                  className="flex flex-wrap items-center text-xs text-white mb-4"
                >
                  <li
                    property="itemListElement"
                    typeof="ListItem"
                    className="px-1"
                  >
                    <Link href={`/`} passHref>
                      <span
                        property="item"
                        typeof="WebPage"
                        className="cursor-pointer"
                      >
                        <span property="name">Home</span>
                      </span>
                    </Link>
                    <meta property="position" content="1" />
                  </li>
                  /
                  {(router?.route === '/campaign/[id]' ||
                    router?.route === '/campaign/chart') && (
                    <>
                      <li
                        property="itemListElement"
                        typeof="ListItem"
                        className="px-1"
                      >
                        <Link legacyBehavior href={`/campaign`}>
                          <span
                            property="item"
                            typeof="WebPage"
                            className="cursor-pointer"
                          >
                            {role == 'advertiser' ? (
                              <span property="name">My Campaigns</span>
                            ) : (
                              <span property="name">Campaigns</span>
                            )}
                          </span>
                        </Link>
                        <meta property="position" content="1" />
                      </li>
                      /
                    </>
                  )}
                  <li
                    property="itemListElement"
                    typeof="ListItem"
                    className="px-1"
                  >
                    <span property="name">{title}</span>
                    <meta property="position" content="3" />
                  </li>
                </ol>
              </div>
              {/* <div
                onClick={onLogout}
                className="flex items-center text-center border-2 text-md pl-4 pr-6 py-1 rounded focus:outline-none font-semibold bg-green-500 text-white border-green-500 cursor-pointer"
              >
                <Logout className="h-6 w-5" />
                <span className="text-[13px] font-semibold ml-2">Sign Out</span>
              </div> */}
              <UserLogout />
            </div>
          </div>
        </div>
        <div className="xl:container mx-auto px-3 -mt-[93px]">
          <div className="lg:flex block pb-20">
            <div className="xl:w-[28%] lg:w-[35%] w-[100%] bg-white dark:bg-black-600 rounded-xl soft-shadow border h-fit mb-4 mr-8">
              <div
                className={`flex justify-between items-center ${
                  showMenu && 'border-b dark:border-black-200'
                } px-5 py-5`}
              >
                <div>
                  {loading || !userDetails ? (
                    <Loader wrapperClassName="w-28 h-5" />
                  ) : (
                    <p className="text-black dark:text-neargray-100">
                      {userDetails?.username}
                    </p>
                  )}
                  {loading || !userDetails ? (
                    <Skeleton className="flex w-full h-8" />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-neargray-100 mt-2">
                      {userDetails?.email}
                    </p>
                  )}
                </div>
                <div
                  className="lg:hidden cursor-pointer delay-300"
                  onClick={() => setShowMenu((o) => !o)}
                >
                  {!showMenu ? <Menu /> : <Close className="mr-1" />}
                </div>
              </div>
              <div
                className={`${
                  showMenu ? 'lg:slide-down disclosure' : 'hidden'
                }`}
              >
                <div className="px-4 py-2">
                  <p className="text-nearblue-600 dark:text-neargray-100 uppercase text-xs py-2">
                    Account
                  </p>

                  <MenuItem
                    href={`/user/overview`}
                    icon={Home}
                    text="Account Overview"
                  />

                  <MenuItem
                    href={`/user/settings`}
                    icon={User}
                    text="Account Settings"
                  />
                </div>

                {role == 'advertiser' && (
                  <div className="px-4 py-2">
                    <p className="text-nearblue-600 dark:text-neargray-100 uppercase text-xs py-2">
                      API
                    </p>
                    <MenuItem
                      href={`/user/plan`}
                      icon={Plan}
                      text="Current Plan"
                    />
                    <MenuItem href={`/user/keys`} icon={Key} text="API Keys" />
                    <MenuItem
                      href={`/user/invoices`}
                      icon={FaFileInvoiceDollar}
                      text="Invoices"
                    />
                    <div className="flex py-2 hover:bg-neargreen/5 dark:hover:bg-black-200 hover:text-green-800/70 dark:hover:text-green-100  text-gray-600 dark:text-neargray-100 rounded-md cursor-pointer">
                      <FileSearch className="h-4 w-4 mx-2" />

                      <a
                        href={docsUrl}
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                      >
                        <span className="flex text-sm px-1">
                          Documentation
                          <span>
                            <Arrow className="-rotate-45 -mt-1 h-4 w-4 fill-black dark:fill-white" />
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                )}
                {role == 'publisher' && (
                  <div className="px-4 py-2">
                    <p className="text-nearblue-600 dark:text-neargray-100 uppercase text-xs py-2">
                      API
                    </p>
                    <MenuItem
                      href={`/publisher/keys`}
                      icon={Key}
                      text="API Keys"
                    />
                    <MenuItem
                      href={`/user/invoices`}
                      icon={FaFileInvoiceDollar}
                      text="Invoices"
                    />
                    <MenuItem
                      href={`/publisher/apisubscriptions`}
                      icon={Campaign}
                      text="API Subscriptions"
                    />
                  </div>
                )}

                <div className="px-4 py-2">
                  <p className="text-nearblue-600 dark:text-neargray-100 uppercase text-xs py-2">
                    Advertise
                  </p>

                  <MenuItem
                    href={`/campaign`}
                    icon={Campaign}
                    text={role == 'advertiser' ? `My Campaigns` : `Campaigns`}
                    exact={true}
                  />

                  {role == 'advertiser' ? (
                    <>
                      <MenuItem
                        href={`/campaign/plans`}
                        icon={Create}
                        text={'Create New Campaign'}
                      />
                    </>
                  ) : (
                    role == 'publisher' && (
                      <>
                        <MenuItem
                          href={`/plans`}
                          icon={Plan}
                          text={'Campaign Plans'}
                        />
                        <MenuItem
                          href={`/publisher/adsubscriptions`}
                          icon={Campaign}
                          text="Campaign Subscriptions"
                        />
                      </>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="w-full overflow-x-auto">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
};
UserLayout.displayName = 'UserLayout';

export default UserLayout;
