import React from 'react';
import Collapse from '../Collapse';
import ArrowDown from '../Icons/ArrowDown';
import Link from 'next/link';
import User from '../Icons/FaUserAlt ';
import ActiveLink from '../ActiveLink';

interface Props {
  user: any;
  token: string;
  profile: any;
  onSignOut: () => void;
}

const UserMenu = ({ user, token, profile, onSignOut }: Props) => {
  return (
    <>
      <Collapse
        trigger={({ show, onClick }) => (
          <span
            className="flex md:!hidden items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4"
            onClick={onClick}
          >
            <div className="w-full" suppressHydrationWarning>
              {user && token ? (
                <div className="flex justify-between" suppressHydrationWarning>
                  <div className="flex items-center" suppressHydrationWarning>
                    <span className="truncate max-w-[110px]">{user}</span>
                  </div>
                  <ArrowDown
                    className={`fill-current transition-transform w-5 h-5 ${
                      show && 'transform rotate-180'
                    }`}
                  />
                </div>
              ) : (
                <div suppressHydrationWarning>
                  <Link href={`/login`} className="w-full flex items-center">
                    <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </span>
        )}
      >
        {user && token && (
          <ul className="border-l-2 border-green-500 md:hidden ml-4">
            {profile.map((menu: any) => (
              <li key={menu.id}>
                <ActiveLink href={menu.link}>
                  <a className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4">
                    {menu.title}
                  </a>
                </ActiveLink>
              </li>
            ))}
            <li className="border-t my-3"></li>
            <li className="px-4 pb-1">
              <button
                onClick={onSignOut}
                className="bg-green-200/70 w-full rounded-md text-white text-xs text-center py-1 whitespace-nowrap dark:bg-green-250 dark:text-neargray-10"
              >
                Sign Out
              </button>
            </li>
          </ul>
        )}
      </Collapse>
      <span className="group hidden md:flex h-full w-full relative">
        <div
          className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 `}
        >
          {user && token ? (
            <>
              <User className="mx-1 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
              <span className="truncate max-w-[110px]">{user}</span>
              <ArrowDown className="fill-current w-4 h-4 ml-2" />
            </>
          ) : (
            <div>
              <ActiveLink href={`/login`}>
                <a className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4">
                  Sign In
                </a>
              </ActiveLink>
            </div>
          )}
        </div>
        {user && token && (
          <ul className="bg-white dark:bg-black-600 soft-shadow hidden  absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:!block py-2 px-4 z-[99]">
            {profile.map((menu: any) => (
              <li key={menu.id}>
                <ActiveLink href={menu.link}>
                  <a className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4">
                    {menu.title}
                  </a>
                </ActiveLink>
              </li>
            ))}
            <li className="border-t my-3"></li>
            <li className="px-4 pb-1">
              <button
                onClick={onSignOut}
                className="bg-green-500 dark:bg-green-250 dark:text-neargray-10 rounded-md text-white text-xs text-center py-1 px-4 whitespace-nowrap"
              >
                Sign Out
              </button>
            </li>
          </ul>
        )}
      </span>
    </>
  );
};
export default UserMenu;
