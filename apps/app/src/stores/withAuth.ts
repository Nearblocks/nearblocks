import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import Cookies from 'js-cookie';
import useStorage from '@/hooks/useStorage';
import useAuth from '@/hooks/useAuth';

function withAuth<P>(Component: React.ComponentType<P>): React.FC<P> {
  const Wrapper: React.FC<P> = (props) => {
    const router = useRouter();
    const [, setLoading] = useState(true);
    const [token, setToken] = useStorage('token');
    const [, setRole] = useStorage('role');
    const [, setUser] = useStorage('user');
    const [, setPlan] = useStorage('plan');

    const { error } = useAuth('/profile');
    const statusCode = get(error, 'response.status') || null;

    useEffect(() => {
      const init = async () => {
        if (!token) {
          setRole('');
          setUser('');
          setPlan('');
          Cookies.set('token', '');
          await router.replace('/login');
          return;
        }
        if (token && router.asPath === '/login') {
          await router.replace('/user/overview');
          return;
        }
        if (statusCode === 401) {
          setToken('');
          setRole('');
          setUser('');
          setPlan('');
          Cookies.set('token', '');
          await router.replace('/login');
          return;
        }
        setLoading(false);
      };

      init();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, router, statusCode]);

    return !token ? null : React.createElement(Component as any, props as any);
  };

  return Wrapper;
}

export default withAuth;
