'use client';
import React, { FC, ReactNode, useState } from 'react';

import useAuth from '@/hooks/app/useAuth';
import { Link, usePathname } from '@/i18n/routing';
import { docsUrl } from '@/utils/app/config';

import ActiveLink from '../ActiveLink';
import Arrow from '../Icons/Arrow';
import Campaign from '../Icons/Campaign';
import Close from '../Icons/Close';
import Create from '../Icons/Create';
import FaFileInvoiceDollar from '../Icons/FaFileInvoiceDollar';
import FileSearch from '../Icons/FileSearch';
import Home from '../Icons/Home';
import Key from '../Icons/Key';
import Menu from '../Icons/Menu';
import Plan from '../Icons/Plan';
import User from '../Icons/User';
import Skeleton from '../skeleton/common/Skeleton';
import UserLogout from './Logout';

interface MenuItemProps {
  exact?: boolean | null;
  href: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  text: string;
}

const MenuItem: FC<MenuItemProps> = ({
  exact = null,
  href,
  icon: Icon,
  text,
}) => (
  <div className="hover:text-green-800/70 text-gray-600 dark:text-neargray-100 rounded-md cursor-pointer">
    <ActiveLink
      activeClassName="text-green-800/70 dark:text-green-100 py-2 bg-neargreen/5 dark:bg-black-200 rounded-md my-1"
      exact={exact}
      href={href}
      inActiveClassName="py-2 hover:bg-neargreen/5 dark:hover:bg-black-200 dark:hover:text-green-100 rounded-md my-1"
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
  role?: string;
  title: string;
}

const UserLayout = ({ children, role, title }: UserLayoutProps) => {
  const [showMenu, setShowMenu] = useState(true);
  const asPath = usePathname();
  const { data: userData, loading } = useAuth('/users/me', {}, true);
  const userDetails = userData?.user || null;

  return (
    <>
      <div>
        <div
          className="h-60 bg-hero-pattern dark:bg-hero-pattern-dark"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <div className="container-xxl mx-auto pt-10">
            <div className="flex items-center justify-between mr-3 -mt-6">
              <div className="ml-3">
                <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white ">
                  {title}
                </h1>
                <ol
                  className="flex flex-wrap items-center text-xs text-white mb-4"
                  typeof="BreadcrumbList"
                  vocab="https://schema.org/"
                >
                  <li
                    className="px-1"
                    property="itemListElement"
                    typeof="ListItem"
                  >
                    <Link href={`/`}>
                      <span
                        className="cursor-pointer"
                        property="item"
                        typeof="WebPage"
                      >
                        <span property="name">Home</span>
                      </span>
                    </Link>
                    <meta content="1" property="position" />
                  </li>
                  /
                  {(asPath === '/campaign/[id]' ||
                    asPath === '/campaign/chart') && (
                    <>
                      <li
                        className="px-1"
                        property="itemListElement"
                        typeof="ListItem"
                      >
                        <Link href={`/campaign`}>
                          <span
                            className="cursor-pointer"
                            property="item"
                            typeof="WebPage"
                          >
                            {role == 'advertiser' ? (
                              <span property="name">My Campaigns</span>
                            ) : (
                              <span property="name">Campaigns</span>
                            )}
                          </span>
                        </Link>
                        <meta content="1" property="position" />
                      </li>
                      /
                    </>
                  )}
                  <li
                    className="px-1"
                    property="itemListElement"
                    typeof="ListItem"
                  >
                    <span property="name">{title}</span>
                    <meta content="3" property="position" />
                  </li>
                </ol>
              </div>
              <UserLogout />
            </div>
          </div>
        </div>
        <div className="container-xxl mx-auto px-3 -mt-[93px]">
          <div className="lg:flex block pb-20">
            <div className="xl:w-[28%] lg:w-[35%] w-[100%] bg-white dark:bg-black-600 rounded-xl soft-shadow border h-fit mb-4 mr-8">
              <div
                className={`flex justify-between items-center ${
                  showMenu && 'border-b dark:border-black-200'
                } px-5 py-5`}
              >
                <div>
                  {loading || !userDetails ? (
                    <div className="py-1.5">
                      <Skeleton className="w-28 h-4" />
                    </div>
                  ) : (
                    <p className="text-nearblue-600 dark:text-neargray-10">
                      {userDetails?.username}
                    </p>
                  )}
                  {loading || !userDetails ? (
                    <div className="pt-1.5 pb-0.5">
                      <Skeleton className="flex w-48 h-4" />
                    </div>
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
                  <p className="text-nearblue-600 dark:text-neargray-10 uppercase text-xs py-2">
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
                    <p className="text-nearblue-600 dark:text-neargray-10 uppercase text-xs py-2">
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
                    <div className="flex py-2 hover:bg-neargreen/5 dark:hover:bg-black-200 hover:text-green-800/70 dark:hover:text-green-100  text-gray-600 dark:!text-neargray-100 rounded-md cursor-pointer">
                      <FileSearch className="h-4 w-4 mx-2" />

                      <a
                        href={docsUrl}
                        rel="noreferrer nofollow noopener"
                        target="_blank"
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
                    <p className="text-nearblue-600 dark:text-neargray-10 uppercase text-xs py-2">
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
                  <p className="text-nearblue-600 dark:text-neargray-10 uppercase text-xs py-2">
                    Advertise
                  </p>
                  <MenuItem
                    exact={true}
                    href={`/campaign`}
                    icon={Campaign}
                    text={role == 'advertiser' ? `My Campaigns` : `Campaigns`}
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
      </div>
    </>
  );
};
UserLayout.displayName = 'UserLayout';

export default UserLayout;
