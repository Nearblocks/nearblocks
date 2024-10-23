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
  const [, setPlanId] = useStorage('stripe-plan-id');
  const [, setIntervel] = useStorage('interval');
  const [, subscribeCalled] = useStorage('subscribe-called');

  /*  const { disconnect } = useDisconnect(); */

  const router = useRouter();

  const onLogout = () => {
    setToken('');
    setRole('');
    setUser('');
    setPlanId('');
    setIntervel('');
    subscribeCalled('');
    /*   disconnect(); */
    Cookies.remove('token');
    router?.replace('/login');
  };

  return (
    <div
      onClick={onLogout}
      className="flex items-center text-center border-2 border-green hover:bg-green-400 bg-green-500 text-md pl-4 pr-6 py-1 rounded-md focus:outline-none font-semibold text-white dark:border-black-200 cursor-pointer"
    >
      <Logout className="h-6 w-5" />
      <span className="text-[13px] font-semibold ml-2">Sign Out</span>
    </div>
  );
};

export default UserLogout;
