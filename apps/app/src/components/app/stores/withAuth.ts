import Cookies from 'js-cookie';
import { get } from 'lodash';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import useAuth from '@/hooks/app/useAuth';
import useStorage from '@/hooks/app/useStorage';

function withAuth<P>(Component: React.ComponentType<P>): React.FC<P> {
  const Wrapper: React.FC<P> = (props) => {
    const role = Cookies.get('role');
    const user = Cookies.get('user');
    const tokenCookie = Cookies.get('token');
    const [token] = useStorage('token');
    const [userName, setUserName] = useState<string>();
    const { data, error, loading } = useAuth('/users/me', {}, true);
    const userData = data?.user;
    const statusCode = get(error, 'response.status') || null;
    const router = useRouter();

    const resetSession = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      Cookies.remove('token');
      Cookies.remove('role');
      Cookies.remove('user');
      router?.push('/login');
      router?.refresh();
    };

    useEffect(() => {
      const checkCookies = () => {
        const u = Cookies.get('user');
        setUserName(u);
      };
      checkCookies();
      const intervalId = setInterval(checkCookies, 1000);
      return () => clearInterval(intervalId);
    }, [user]);

    useEffect(() => {
      if (!loading && userData) {
        const name = userData?.username;
        if (userName !== name) {
          router?.refresh();
        }
      }
    }, [loading, userData, userName, router]);

    useEffect(() => {
      if (token || userName) {
        if (!tokenCookie || !role || !user) {
          resetSession();
        }
      } else {
        resetSession();
      }
      if (statusCode === 401) {
        resetSession();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userName, statusCode]);

    return React.createElement(Component as any, props as any);
  };

  return Wrapper;
}

export default withAuth;
