import { useContext } from 'react';
import Collapse from '@/components/app/Collapse';
import ArrowDown from '@/components/app/Icons/ArrowDown';
import User from '@/components/app/Icons/FaUserAlt ';
import { NearContext } from '@/components/app/wallet/near-context';

interface Props {
  AccountId?: string;
}

const UserMenu = ({ AccountId: signedAccountId }: Props) => {
  let { wallet } = useContext(NearContext);
  return (
    <>
      <Collapse
        trigger={({ show, onClick }) => (
          <button
            className="flex md:!hidden items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4"
            onClick={(event: any) => {
              event.preventDefault();
              if (!signedAccountId) {
                wallet?.signIn();
              } else {
                onClick(event);
              }
            }}
          >
            <div className="w-full">
              {signedAccountId ? (
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="truncate max-w-[110px] font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                      {signedAccountId}
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
                  <div className="w-full flex items-center font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                    <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                    Sign In
                  </div>
                </div>
              )}
            </div>
          </button>
        )}
      >
        {signedAccountId && (
          <ul className="border-l-2 border-green-500 md:hidden ml-4 my-2 -z-20">
            <li className="px-4 pb-1">
              <button
                onClick={wallet?.signOut}
                className="bg-green-500 w-full rounded-md text-white text-xs text-center py-1 whitespace-nowrap dark:bg-green-250 dark:text-neargray-10"
              >
                Sign Out
              </button>
            </li>
          </ul>
        )}
      </Collapse>
      <div className="group hidden md:flex h-full w-full relative">
        <button
          className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 `}
          onClick={() => !signedAccountId && wallet?.signIn()}
        >
          {signedAccountId ? (
            <>
              <User className="mx-1 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
              <span className="truncate max-w-[110px] font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                {signedAccountId}
              </span>
              <ArrowDown className="fill-current w-4 h-4 ml-2" />
            </>
          ) : (
            <div>
              <div className="flex items-center font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                <>
                  <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                  Sign In
                </>
              </div>
            </div>
          )}
        </button>
        {signedAccountId && (
          <ul className="bg-white dark:bg-black-600 soft-shadow hidden  absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:!block py-2 px-4 z-20">
            <li className="px-8 py-1">
              <button
                onClick={wallet?.signOut}
                className="hover:bg-green-400 bg-green-500 dark:text-neargray-10 rounded-md text-white text-xs text-center py-1 px-4 whitespace-nowrap"
              >
                Sign Out
              </button>
            </li>
          </ul>
        )}
      </div>
    </>
  );
};
export default UserMenu;
