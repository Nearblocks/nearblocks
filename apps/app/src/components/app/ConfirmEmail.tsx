'use client';
import Cookies from 'js-cookie';
import get from 'lodash/get';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { request } from '@/hooks/app/useAuth';
import useStorage from '@/hooks/app/useStorage';
import { useConfig } from '@/hooks/app/useConfig';

interface ConfirmEmailClientProps {
  authToken: null | string;
  authUsername: null | string;
  authUserRole: null | string;
  status: number;
}

const ConfirmEmail = ({
  authToken,
  authUsername,
  authUserRole,
  status,
}: ConfirmEmailClientProps) => {
  const router = useRouter();
  const [, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');
  const { userApiURL: baseURL } = useConfig();
  const onLogin = () => router.push('/login');
  const onResend = () => router.push('/resend');

  const resetStripePlan = () => {
    localStorage.removeItem('stripe-plan-id');
    localStorage.removeItem('interval');
    localStorage.removeItem('subscribe-called');
    return;
  };

  const subscribePlan = async () => {
    try {
      const stripePlanId = localStorage.getItem('stripe-plan-id');
      const interval =
        localStorage.getItem('interval') === 'year' ? 'year' : 'month';

      const res = await request(baseURL).post('advertiser/subscribe', {
        interval,
        plan_id: stripePlanId,
      });
      localStorage.setItem('subscribe-called', 'true');

      const redirectUrl = res?.data['url '];
      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }
      const status = res?.data?.message;
      if (status) {
        resetStripePlan();
        router.push(`/user/plan?status=${status}`);
        return;
      }
      resetStripePlan();
      router.push('/user/plan');
    } catch (error) {
      const statusCode = get(error, 'response.status') || null;

      if (statusCode === 422) {
        resetStripePlan();
        router.push('/user/plan?status=exists');
      } else if (statusCode === 400) {
        resetStripePlan();
        router.push('/user/plan?status=invalid');
      }
    }
  };

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
      const stripePlanId = localStorage.getItem('stripe-plan-id');
      const interval = localStorage.getItem('interval');
      if (stripePlanId && interval) {
        subscribePlan();
      } else {
        router.replace('/user/overview');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section>
      <div className="container-xxl mx-auto">
        <div className="mx-auto px-5 align-middle max-w-[685px]">
          {[200, 204].includes(status) && (
            <div className="py-36">
              <h1 className="text-3xl text-green-500 dark:text-green-250 py-4 text-center">
                Confirm Your Email
              </h1>
              <div className="bg-blue-200/30 dark:bg-blue-200/5 text-green-500 dark:text-green-250 rounded-md px-5 py-5">
                <span className="font-bold">Congratulations!</span> Your account
                is successfully verified. Enjoy your Nearblocks services.
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
                link. Please confirm you entered the correct URL or click on the
                button below to resend the confirmation link.
              </div>
              <div className="w-full text-right my-4 justify-between flex items-center">
                <a
                  className="underline text-xs text-gray-600 dark:text-neargray-10 cursor-pointer"
                  onClick={onLogin}
                >
                  Back to sign in
                </a>
                <button
                  className="text-sm text-white text-center font-semibold w-56 py-3 hover:bg-green-400 bg-green-500 rounded"
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
  );
};

export default ConfirmEmail;
