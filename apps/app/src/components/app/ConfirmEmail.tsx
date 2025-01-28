'use client';
import get from 'lodash/get';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { request } from '@/hooks/app/useAuth';
import { useConfig } from '@/hooks/app/useConfig';
import { getCookie, setCookie } from '@/utils/app/actions';

interface ConfirmEmailClientProps {
  authToken?: string;
  status: number;
}

const ConfirmEmail = ({ authToken, status }: ConfirmEmailClientProps) => {
  const router = useRouter();
  const { userApiURL: baseURL } = useConfig();
  const onLogin = () => router.push('/login');
  const onResend = () => router.push('/resend');

  const resetStripePlan = async () => {
    Cookies.remove('stripe-plan-id');
    Cookies.remove('interval');
    return;
  };

  const subscribePlan = async (stripePlanId: string, interval: string) => {
    try {
      const res = await request(baseURL).post('advertiser/subscribe', {
        interval,
        plan_id: stripePlanId,
      });

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
    const handleAuth = async () => {
      if (authToken) {
        setCookie('token', authToken);
        const tokenCookie = await getCookie('token');
        if (tokenCookie) {
          const stripePlanId = await getCookie('stripe-plan-id');
          const interval =
            (await getCookie('interval')) === 'year' ? 'year' : 'month';
          if (stripePlanId && interval) {
            subscribePlan(stripePlanId, interval);
          } else {
            router.replace('/user/overview');
          }
        }
      }
    };
    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  return (
    <section>
      <div className="container-xxl mx-auto">
        <div className="mx-auto px-5 align-middle max-w-[685px]">
          {[200, 204].includes(status) && (
            <div className="py-36">
              <h1 className="text-2xl text-green-500 dark:text-green-250 py-4 text-center">
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
              <h1 className="text-2xl text-green-500 dark:text-green-250 py-4 text-center">
                Verification Failed
              </h1>
              <div className="bg-red-50 text-red-500 dark:bg-red-500/[0.10] text-sm rounded-md px-5 py-5">
                <span className="font-bold">Oops!</span> Invalid confirmation
                link. Please confirm you entered the correct URL or click on the
                button below to resend the confirmation link.
              </div>
              <div className="w-full text-right my-4 justify-between flex items-center">
                <a
                  className="underline text-sm font-medium text-gray-600 dark:text-neargray-100 cursor-pointer"
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
