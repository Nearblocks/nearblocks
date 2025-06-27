import { get } from 'lodash';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import useAuth from '@/hooks/app/useAuth';
import { signOut } from '@/utils/app/actions';

function withAuth<P>(Component: React.ComponentType<P>): React.FC<P> {
  const Wrapper: React.FC<P> = (props) => {
    const { error } = useAuth('/users/me', {}, true);
    const router = useRouter();
    const statusCode = get(error, 'response.status') || null;

    useEffect(() => {
      let hasRefreshed = false;

      const checkCookies = () => {
        const token = Cookies.get('token');
        if (!token && !hasRefreshed) {
          hasRefreshed = true;
          router.refresh();
        }
      };

      checkCookies();
      const intervalId = setInterval(checkCookies, 300);

      return () => clearInterval(intervalId);
    }, [router]);

    useEffect(() => {
      if (statusCode === 401) {
        signOut();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusCode]);

    return React.createElement(Component as any, props as any);
  };

  return Wrapper;
}

export default withAuth;
