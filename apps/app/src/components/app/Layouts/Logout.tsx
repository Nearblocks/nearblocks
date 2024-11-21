import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

import Logout from '../Icons/Logout';

const UserLogout = () => {
  const router = useRouter();

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('stripe-plan-id');
    localStorage.removeItem('interval');
    localStorage.removeItem('subscribe-called');
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('user');
    router?.push('/login');
    router?.refresh();
  };

  return (
    <div
      className="flex items-center text-center border-2 border-green hover:bg-green-400 bg-green-500 text-md pl-4 pr-6 py-1 rounded-md focus:outline-none font-semibold text-white dark:border-black-200 cursor-pointer"
      onClick={onLogout}
    >
      <Logout className="h-6 w-5" />
      <span className="text-[13px] font-semibold ml-2">Sign Out</span>
    </div>
  );
};

export default UserLogout;
