import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import get from 'lodash/get';
import Cookies from 'js-cookie';
import Layout from '@/components/Layouts';
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import useStorage from '@/hooks/useStorage';
import { GetServerSideProps } from 'next';
import { fetcher } from '@/hooks/useFetch';

const title = `Register | Nearblocks`;

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
  status: number | null;
  message: string | null;
  authToken: string | null;
  authUserRole: string | null;
  authUsername: string | null;
}> = async (context) => {
  let status = null;
  let message = null;
  let token = null;
  let role = null;
  let username = null;

  const {
    query: { email, code },
  } = context;

  try {
    const res = await request.post(`/verify`, { email, code });
    if (
      res?.data?.meta?.token &&
      res?.data?.data?.role &&
      res?.data?.data?.username
    ) {
      token = res?.data?.meta?.token;
      role = res?.data?.data?.role[0]?.name || null;
      username = res?.data?.data?.username;
    }
    status = res?.status;
  } catch (error: any) {
    message = catchErrors(error);
    status = error?.response?.status ?? null;
  }

  try {
    const [statsResult, latestBlocksResult] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    return {
      props: {
        statsDetails,
        latestBlocks,
        status,
        message,
        authToken: token,
        authUserRole: role,
        authUsername: username,
      },
    };
  } catch (error) {
    console.error('Error fetching charts or blocks:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
        status,
        message,
        authToken: token,
        authUserRole: role,
        authUsername: username,
      },
    };
  }
};

interface ConfirmEmailProps {
  status: number;
  authToken: string;
  authUserRole: string;
  authUsername: string;
}

const ConfirmEmail = ({
  status,
  authToken,
  authUserRole,
  authUsername,
}: ConfirmEmailProps) => {
  const router = useRouter();
  const [, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');

  const onLogin = () => router.push('/login');
  const onResend = () => router.push('/resend');

  const resetStripePlan = () => {
    localStorage.setItem('stripe-plan-id', '');
    localStorage.setItem('interval', '');
    localStorage.setItem('subscribe-called', '');

    return;
  };

  const subscribePlan = async () => {
    try {
      const stripePlanId = localStorage.getItem('stripe-plan-id');
      const interval = localStorage.getItem('interval');

      const res = await request.post(`advertiser/subscribe`, {
        interval: interval === 'year' ? 'year' : 'month',
        plan_id: stripePlanId,
      });
      localStorage.setItem('subscribe-called', 'true');

      if (res?.data && res?.data['url ']) {
        router.push(res?.data['url ']);
        return;
      }

      if (res?.data && res?.data['message'] === 'upgraded') {
        resetStripePlan();
        router.push('/user/plan?status=upgraded');
        return;
      }

      if (res?.data && res?.data['message'] === 'downgraded') {
        resetStripePlan();
        router.push('/user/plan?status=downgraded');
        return;
      }

      resetStripePlan();
      router.push('/user/plan');
      return;
    } catch (error) {
      const statusCode = get(error, 'response.status') || null;

      if (statusCode === 422) {
        resetStripePlan();
        router.push('/user/plan?status=exists');
        return;
      }
      if (statusCode === 400) {
        resetStripePlan();
        router.push('/user/plan?status=invalid');
        return;
      }
      return null;
    }
  };

  useEffect(() => {
    if (authToken && authUserRole && authUsername) {
      setToken(authToken);
      setRole(authUserRole);
      setUser(authUsername);
      Cookies.set('token', authToken);
      const stripePlanId = localStorage.getItem('stripe-plan-id');
      const interval = localStorage.getItem('interval');
      setTimeout(() => {
        if (stripePlanId && interval) {
          subscribePlan();
        } else {
          router.replace('/user/overview');
        }
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
      </Head>
      <section>
        <div className="container mx-auto">
          <div className="mx-auto px-5 align-middle max-w-[685px]">
            {[200, 204].includes(status) && (
              <div className="py-36">
                <h1 className="text-3xl text-green-500 dark:text-green-250 py-4 text-center">
                  Confirm Your Email
                </h1>
                <div className="bg-blue-200/30 dark:bg-blue-200/5 text-green-500 dark:text-green-250 rounded-md px-5 py-5">
                  <span className="font-bold">Congratulations!</span> Your
                  account is succcessfully verfied. Enjoy your Nearblocks
                  services
                </div>
              </div>
            )}
            {[422, 400].includes(status) && (
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
                    onClick={onLogin}
                    className="underline text-xs text-gray-500 dark:text-neargray-200 cursor-pointer"
                  >
                    Back to sign in
                  </a>
                  <button
                    onClick={onResend}
                    type="button"
                    className="text-sm text-white  text-center font-semibold w-56 py-3 hover:bg-green-400 bg-green-500 rounded"
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

ConfirmEmail.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default ConfirmEmail;
