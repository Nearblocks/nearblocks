import * as Yup from 'yup';
import { env } from 'next-runtime-env';
import Head from 'next/head';
import Link from 'next/link';
import get from 'lodash/get';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, ReactElement, useRef } from 'react';
import { useRouter } from 'next/router';
/* import { useDisconnect, useAccount } from "wagmi"; */
/* import { ConnectButton } from "@rainbow-me/rainbowkit"; */
import Cookies from 'js-cookie';
import { request } from '@/hooks/useAuth';
import useStorage from '@/hooks/useStorage';
import { catchErrors } from '@/utils/libs';
import VisibilityOff from '@/components/Icons/VisibilityOff';
import Visibility from '@/components/Icons/Visibility';
import Layout from '@/components/Layouts';
import { GetServerSideProps } from 'next';
import { fetcher } from '@/hooks/useFetch';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useTheme } from 'next-themes';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async (context) => {
  const { req, res, query } = context;
  const { id, interval } = query;
  let token = req.cookies.token;

  try {
    // Redirection logic based on token and query parameters
    if (token && (!id || !interval)) {
      res.writeHead(302, {
        Location: `/user/overview`,
      });
      res.end();
      return {
        props: {
          statsDetails: null,
          latestBlocks: null,
        },
      };
    }

    // Fetching data from APIs
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
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const title = `Login | NearBlocks`;

const validationSchema = Yup.object().shape({
  usernameOrEmail: Yup.string().required('Please enter username'),
  password: Yup.string()
    .required('Please enter  password')
    .min(8, 'Password must be an 8 character'),
});

const Login = () => {
  const router = useRouter();
  /* const { isConnected } = useAccount(); */
  /*   const brand = env('NEXT_PUBLIC_BRAND'); */
  const { theme } = useTheme();
  const siteKey = env('NEXT_PUBLIC_TURNSTILE_SITE_KEY');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [updatePassMsg, setUpdatePassMsg] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [tokens, setTokens] = useState<string>();
  const [, setPlanId] = useStorage('stripe-plan-id');
  const [, setIntervel] = useStorage('interval');
  const [, subscribeCalled] = useStorage('subscribe-called');

  const turnstileRef = useRef<TurnstileInstance>(null);

  const { id, interval } = router.query;

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
        await router.push(res?.data['url ']);
        return;
      }
      if (res?.data && res?.data['message'] === 'upgraded') {
        resetStripePlan();
        router.push('/user/plan?status=upgraded');
      }
      if (res?.data && res?.data['message'] === 'downgraded') {
        resetStripePlan();
        router.push('/user/plan?status=downgraded');
      }
      resetStripePlan();
      router.push('/user/plan');
    } catch (error) {
      const statusCode = get(error, 'response.status') || null;

      if (statusCode === 422) {
        resetStripePlan();
        router.push('/user/plan?status=exists');
      }
      if (statusCode === 400) {
        resetStripePlan();
        router.push('/user/plan?status=invalid');
      }
    }
  };

  /*   useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected]); */

  useEffect(() => {
    const { id, interval } = router.query;
    if (id) {
      localStorage.setItem('stripe-plan-id', id as string);
      localStorage.setItem('interval', interval as string);
      localStorage.setItem('subscribe-called', '');
    }
  }, [router.query]);

  useEffect(() => {
    if (token) {
      if (id && interval) {
        subscribePlan();
      } else {
        router.replace('/user/overview');
      }
    } else {
      if (!(id && interval)) {
        setPlanId('');
        setIntervel('');
        subscribeCalled('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSubmit = async (values: FormikValues) => {
    if (status != 'solved' || !tokens) {
      // setStatus('error');
      // return;
    }
    try {
      const res = await request.post(`login`, {
        username_or_email: values.usernameOrEmail,
        password: values.password,
      });

      if (
        res?.data?.meta?.token &&
        res?.data?.data?.role &&
        res?.data?.data?.username
      ) {
        setToken(res?.data?.meta?.token);
        setRole(res?.data?.data?.role[0].name);
        setUser(res?.data?.data?.username);
        Cookies.set('token', res?.data?.meta?.token, { expires: 7 }); // Expires in 7 days
      }
      router.replace('/user/overview');
    } catch (error) {
      const message = catchErrors(error);
      const statusCode = get(error, 'response.status') || null;
      if (statusCode === 400) {
        return setErrorMsg(message);
      }
      if (statusCode === 403) {
        return setUpdatePassMsg(message);
      }
      if (!toast.isActive('login-error')) {
        toast.error(message, {
          toastId: 'login-error',
        });
      }
    }
  };

  Cookies.get('token');

  const formik = useFormik({
    initialValues: {
      usernameOrEmail: '',
      password: '',
      remember: false,
    },
    onSubmit,
    validationSchema,
  });

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
      </Head>
      <section>
        <div className="container mx-auto py-20">
          <div className="mx-auto px-5 align-middle max-w-[685px]">
            <form method="post" onSubmit={formik.handleSubmit}>
              <h1 className="text-3xl text-green-500 dark:text-green-250 py-2 font-semibold text-center">
                Welcome back
              </h1>
              <span className="text-sm text-gray-400 py-2 font-thin text-center">
                {/* Login to your account */}
                <p className="text-gray-600 dark:text-white text-sm my-1 font-thin">
                  Don&apos;t have an account?{' '}
                  <span className="text-green-500 dark:text-green-250">
                    <Link href="/register">
                      <span className="font-semibold"> Sign up</span>
                    </Link>
                  </span>
                </p>
              </span>
              {errorMsg && (
                <p className="text-red-500 bg-red-500/20 px-3 py-3 rounded-md text-xs">
                  {errorMsg}{' '}
                  <Link href="/resend">
                    <span className="text-green-500 dark:text-green-250 cursor-pointer">
                      [re-sent]
                    </span>
                  </Link>
                </p>
              )}
              {updatePassMsg && (
                <p className="text-red-500 bg-red-500/20 px-3 py-3 rounded-md text-xs">
                  {updatePassMsg}
                </p>
              )}
              {status === 'error' && (
                <p className="text-red-500 bg-red-500/20 px-3 py-3 rounded-md text-xs">
                  Error! Invalid captcha response.
                </p>
              )}

              <div className="py-2">
                <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                  Username or Email
                </p>
                <input
                  autoComplete="off"
                  name="usernameOrEmail"
                  value={formik.values.usernameOrEmail}
                  onChange={formik.handleChange}
                  required
                  className="px-3 h-12 w-full bg-white text-black-300 dark:text-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      formik.handleSubmit();
                    }
                  }}
                />
                {formik.touched.usernameOrEmail &&
                  formik.errors.usernameOrEmail && (
                    <small className="text-red-500">
                      {formik.errors.usernameOrEmail}
                    </small>
                  )}
              </div>
              <div className="py-2">
                <div className="flex justify-between">
                  <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                    Password
                  </p>
                  <Link href="/lostpassword">
                    <span className="py-2 text-xs text-gray-600 dark:text-white font-thin hover:text-green-500 dark:hover:text-green-250">
                      Forgot your password?
                    </span>
                  </Link>
                </div>
                <div className="relative w-full">
                  <input
                    autoComplete="off"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    required
                    className="px-3 h-12 w-full bg-white text-black-300 dark:text-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        formik.handleSubmit();
                      }
                    }}
                  />
                  <button
                    className="absolute top-0 right-0 h-full px-3"
                    onClick={(e) => togglePasswordVisibility(e)}
                  >
                    {showPassword ? (
                      <Visibility className="w-4 h-4" />
                    ) : (
                      <VisibilityOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <small className="text-red-500">
                    {formik.errors.password}
                  </small>
                )}
              </div>
              <div className="py-2">
                <p className="text-sm text-gray-600 dark:text-white font-thin">
                  <span>
                    <input
                      type="checkbox"
                      value={formik.values.remember as any}
                      onChange={(e) =>
                        formik.setFieldValue('remember', e.target.checked)
                      }
                      className="mr-2"
                    />
                  </span>
                  Remember & Auto Login
                </p>
              </div>
              <div className="flex justify-center pt-4">
                <Turnstile
                  ref={turnstileRef}
                  options={{ theme: theme as any }}
                  siteKey={siteKey as string}
                  onError={() => setStatus('error')}
                  onExpire={() => setStatus('expired')}
                  onSuccess={(token) => {
                    setTokens(token);
                    setStatus('solved');
                  }}
                />
              </div>
              <div className="w-full text-left my-5">
                <button
                  disabled={formik.isSubmitting}
                  type="submit"
                  className={`w-full text-sm focus:outline-none text-white text-center font-semibold py-3 bg-green-500 rounded ${
                    status != 'solved' && formik.isSubmitting
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:bg-green-400'
                  } `}
                >
                  Login
                </button>
              </div>
            </form>
            {/*    {!(brand === "near") && (
              <div className="my-4">
                <ConnectButton.Custom>
                  {({ account, chain, openConnectModal, mounted }) => {
                    return (
                      <div
                        {...(!mounted && {
                          "aria-hidden": true,
                          style: {
                            opacity: 0,
                            pointerEvents: "none",
                            userSelect: "none",
                            alignItems: "center",
                          },
                        })}
                      >
                        {(() => {
                          if (!mounted || !account || !chain) {
                            return (
                              <>
                                <div className="text-center relative">
                                  <span className="inline-block bg-white px-2 relative z-10 text-sm text-gray-500 dark:text-white">
                                    OR
                                  </span>
                                  <span className="absolute top-1/2 left-0 w-1/2 h-px bg-gray-200 dark:bg-black-200 transform -translate-y-1/2"></span>
                                  <span className="absolute top-1/2 right-0 w-1/2 h-px bg-gray-200 dark:bg-black-200 transform -translate-y-1/2"></span>
                                </div>
                                <div className="my-4">
                                  <div className="py-3 text-gray-700">
                                    <div
                                      className="block text-center  border-2 text-sm py-3 rounded w-full focus:outline-none text-green-500 font-semibold border-green-500 hover:bg-green-500 hover:text-white cursor-pointer"
                                      onClick={openConnectModal}
                                    >
                                      &nbsp; {t("wallet.connectWallet")}
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          }
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            )} */}
          </div>
        </div>
      </section>
    </>
  );
};

Login.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default Login;
