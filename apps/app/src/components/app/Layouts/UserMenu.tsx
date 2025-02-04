import { Link } from '@/i18n/routing';

import ActiveLink from '../ActiveLink';
import Collapse from '../Collapse';
import ArrowDown from '../Icons/ArrowDown';
import User from '../Icons/FaUserAlt ';
import { signOut } from '@/utils/app/actions';

interface Props {
  profile: any;
  user: any;
}

const UserMenu = ({ profile, user }: Props) => {
  return (
    <>
      <Collapse
        trigger={({ onClick, show }) => (
          <span
            className="flex md:!hidden items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4"
            onClick={onClick}
          >
            <div className="w-full">
              {user ? (
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="truncate max-w-[110px] font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                      {user}
                    </span>
                  </div>
                  <ArrowDown
                    className={`fill-current transition-transform w-5 h-5 ${
                      show && 'transform rotate-180'
                    }`}
                  />
                </div>
              ) : (
                <div>
                  <Link
                    className="w-full flex items-center font-medium text-sm dark:text-neargray-10 text-nearblue-600"
                    href={`/login`}
                  >
                    <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </span>
        )}
      >
        {user && (
          <ul className="border-l-2 border-green-500 md:hidden ml-4 -z-20">
            {profile.map((menu: any) => (
              <li key={menu.id}>
                <ActiveLink href={menu.link}>
                  <div className="block w-full hover:text-green-500 dark:hover:text-green-250 font-medium text-sm dark:text-neargray-10 text-nearblue-600 py-2 px-4">
                    {menu.title}
                  </div>
                </ActiveLink>
              </li>
            ))}
            <li className="border-t my-3"></li>
            <li className="px-4 pb-1">
              <button
                className="bg-green-500 w-full rounded-md text-white text-xs text-center py-1 whitespace-nowrap dark:bg-green-250 dark:text-neargray-10"
                onClick={() => signOut()}
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
          {user ? (
            <>
              <User className="mx-1 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
              <span className="truncate max-w-[110px] font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                {user}
              </span>
              <ArrowDown className="fill-current w-4 h-4 ml-2" />
            </>
          ) : (
            <div className="flex items-center">
              <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
              <Link
                className="flex font-medium text-sm dark:text-neargray-10 text-nearblue-600"
                href={`/login`}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
        {user && (
          <ul className="bg-white dark:bg-black-600 soft-shadow hidden  absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:!block py-2 px-4 z-20">
            {profile.map((menu: any) => (
              <li key={menu.id}>
                <ActiveLink href={menu.link}>
                  <div className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                    {menu.title}
                  </div>
                </ActiveLink>
              </li>
            ))}
            <li className="border-t my-3"></li>
            <li className="px-4 pb-1">
              <button
                className="hover:bg-green-400 bg-green-500 dark:text-neargray-10 rounded-md text-white text-xs text-center py-1 px-4 whitespace-nowrap"
                onClick={() => signOut()}
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
