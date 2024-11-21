'use client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import useStorage from '@/hooks/app/useStorage';

interface ConfirmEmailClientProps {
  authToken: null | string;
  authUsername: null | string;
  authUserRole: null | string;
  status: number;
}
const EmailUpdate = ({
  authToken,
  authUsername,
  authUserRole,
  status,
}: ConfirmEmailClientProps) => {
  const [, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');
  const router = useRouter();
  const onLogin = () => router.push('/login');
  const onResend = () => router.push('/resend');

  useEffect(() => {
    if (authToken && authUserRole && authUsername) {
      setToken(authToken);
      setRole(authUserRole);
      setUser(authUsername);
      Cookies.set('token', authToken, {
        expires: 30,
      });
      Cookies.set('role', authUserRole, {
        expires: 30,
      });
      Cookies.set('user', authUsername, {
        expires: 30,
      });
      router.replace('/user/overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section>
        <div className="container-xxl mx-auto">
          <div className="mx-auto px-5 align-middle max-w-[685px]">
            {[200, 204].includes(status) && (
              <div className="py-36">
                <h1 className="text-3xl text-green-500 dark:text-green-250 py-4 text-center">
                  Changed Your Email
                </h1>
                <div className="bg-blue-200/30 dark:bg-blue-200/5 text-green-500 dark:text-green-250 rounded-md px-5 py-5">
                  <span className="font-bold">Congratulations!</span> Your email
                  is succcessfully verfied. Enjoy your Nearblocks services
                </div>
              </div>
            )}
            {[400, 422].includes(status) && (
              <div className="py-28">
                <h1 className="text-3xl text-green-500 dark:text-green-250 py-4 text-center">
                  Verification Failed
                </h1>
                <div className="bg-red-50 text-red-500 dark:bg-red-500/[0.10] text-sm rounded-md px-5 py-5">
                  <span className="font-bold">Oops!</span> Invalid confirmation
                  link. Please confirm you entered the correct URL or click on
                  the button below to resend the confirmation link.
                </div>

                <div className="w-full text-right my-4 justify-between flex items-center">
                  <a
                    className="underline text-xs text-gray-600 dark:text-neargray-10 cursor-pointer"
                    onClick={onLogin}
                  >
                    Back to sign in
                  </a>
                  <button
                    className="text-sm text-white  text-center font-semibold w-56 py-3 hover:bg-green-400 bg-green-500 rounded"
                    onClick={onResend}
                    type="button"
                  >
                    Resend
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
export default EmailUpdate;
