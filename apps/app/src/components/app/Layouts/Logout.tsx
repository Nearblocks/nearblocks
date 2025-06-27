import { signOut } from '@/utils/app/actions';
import Logout from '@/components/app/Icons/Logout';

const UserLogout = () => {
  return (
    <div
      className="flex items-center border-green border text-center hover:bg-green-400 bg-green-300 dark:bg-green-500 dark:hover:bg-green-400 text-md pl-2 pr-2 py-1 rounded-md focus:outline-none font-semibold text-white dark:border-black-200 cursor-pointer"
      onClick={() => signOut()}
    >
      <Logout className="h-6 w-5" />
      <span className="text-[13px] font-semibold ml-2">Sign Out</span>
    </div>
  );
};

export default UserLogout;
