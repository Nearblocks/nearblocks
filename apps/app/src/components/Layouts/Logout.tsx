import React from 'react';
import { useRouter } from 'next/router';
/* import { useDisconnect } from "wagmi"; */
import Cookies from 'js-cookie';

import useStorage from '@/hooks/useStorage';
import Logout from '../Icons/Logout';

const UserLogout = () => {
  const [, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');
  /*  const { disconnect } = useDisconnect(); */

  const router = useRouter();

  const onLogout = () => {
    setToken('');
    setRole('');
    setUser('');
    /*   disconnect(); */
    Cookies.remove('token');
    router?.push('/login');
  };

  return (
    <div
      onClick={onLogout}
      className="flex items-center text-center border-2 text-md pl-4 pr-6 py-1 rounded focus:outline-none font-semibold bg-primary text-white border-primary cursor-pointer"
    >
      <Logout className="h-6 w-5" />
      <span className="text-[13px] font-semibold ml-2">Sign Out</span>
    </div>
  );
};

export default UserLogout;
