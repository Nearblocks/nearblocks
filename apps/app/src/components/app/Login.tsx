'use client';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { FormikValues, useFormik } from 'formik';
import Cookies from 'js-cookie';
import get from 'lodash/get';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import Visibility from '@/components/app/Icons/Visibility';
import VisibilityOff from '@/components/app/Icons/VisibilityOff';
import { request } from '@/hooks/app/useAuth';
import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import { catchErrors, getUserDataFromToken } from '@/utils/app/libs';
import { getCookie, setCookie } from '@/utils/app/actions';
import { UserToken } from '@/utils/types';

interface Props {
  id?: string;
  interval?: string;
  turnstileSiteAuth: (tokens: string) => any;
}

const Login = ({ id, interval, turnstileSiteAuth }: Props) => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [tokens, setTokens] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [updatePassMsg, setUpdatePassMsg] = useState('');
  const { userAuthURL } = useConfig();
  const { userApiURL } = useConfig();
  const { theme } = useTheme();
  const { siteKey } = useConfig();

  const turnstileRef = useRef<TurnstileInstance>(null);
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .required('Please enter  password')
      .min(8, 'Password must be an 8 character'),
    usernameOrEmail: Yup.string().required('Please enter username'),
  });

  const resetStripePlan = () => {
    Cookies.remove('stripe-plan-id');
    Cookies.remove('interval');
    return;
  };
  const subscribePlan = async (stripePlanId: string, interval: string) => {
    try {
      const res = await request(userApiURL).post('advertiser/subscribe', {
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
    const updateCookies = async () => {
      if (id) {
        setCookie('stripe-plan-id', id as string);
        setCookie('interval', interval as string);
      } else {
        resetStripePlan();
      }
    };

    updateCookies();
  }, [id, interval]);

  useEffect(() => {
    let hasRefreshed = false;
    const checkCookies = () => {
      const token = Cookies.get('token');
      const userData: UserToken | null = getUserDataFromToken(token);
      const u = userData?.username;
      if (u && !hasRefreshed) {
        hasRefreshed = true;
        router.refresh();
      }
    };
    checkCookies();
    const intervalId = setInterval(checkCookies, 300);
    return () => clearInterval(intervalId);
  }, [router]);

  const onSubmit = async (values: FormikValues) => {
    if (status != 'solved' || !tokens) {
      setStatus('error');
      return;
    }
    const response: boolean = await turnstileSiteAuth(tokens);
    if (response) {
      try {
        const res = await request(userAuthURL).post(`login`, {
          password: values.password,
          username_or_email: values.usernameOrEmail,
        });
        const respToken = res?.data?.token;

        const userData: any = getUserDataFromToken(respToken);

        if (userData) {
          setCookie('token', respToken);
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
    } else {
      setStatus('error');
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      remember: false,
      usernameOrEmail: '',
    },
    onSubmit,
    validationSchema,
  });

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <section>
      <div className="container-xxl mx-auto py-20">
        <div className="mx-auto px-5 align-middle max-w-[685px]">
          <form method="post" onSubmit={formik.handleSubmit}>
            <h1 className="text-2xl text-green-500 dark:text-green-250 py-2 font-semibold text-center">
              Welcome back
            </h1>
            <span className="py-2 text-center">
              {/* Login to your account */}
              <p className="text-gray-600 text-sm  font-medium dark:text-white my-1">
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
              <p className="py-2 text-sm font-medium text-black-600 dark:text-neargray-100">
                Username or Email
              </p>
              <input
                autoComplete="off"
                className="px-3 h-12 w-full bg-white text-black-300 dark:text-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base"
                name="usernameOrEmail"
                onChange={formik.handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    formik.handleSubmit();
                  }
                }}
                required
                value={formik.values.usernameOrEmail}
              />
              {formik.touched.usernameOrEmail &&
                formik.errors.usernameOrEmail && (
                  <small className="text-red-500">
                    {formik.errors.usernameOrEmail}
                  </small>
                )}
            </div>
            <div className="py-2">
              <div className="flex justify-between items-center">
                <p className="py-2 text-sm text-black-600 font-medium dark:text-neargray-100">
                  Password
                </p>
                <Link href="/lostpassword">
                  <span className="py-2 text-sm font-medium text-gray-600 dark:text-white hover:text-green-500 dark:hover:text-green-250">
                    Forgot your password?
                  </span>
                </Link>
              </div>
              <div className="relative w-full">
                <input
                  autoComplete="off"
                  className="px-3 h-12 w-full bg-white text-black-300 dark:text-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base"
                  name="password"
                  onChange={formik.handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      formik.handleSubmit();
                    }
                  }}
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
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
                <small className="text-red-500">{formik.errors.password}</small>
              )}
            </div>
            <div className="py-2">
              <p className="text-sm font-medium text-gray-600 dark:text-white flex">
                <span className="flex">
                  <input
                    className="mr-2"
                    onChange={(e) =>
                      formik.setFieldValue('remember', e.target.checked)
                    }
                    type="checkbox"
                    value={formik.values.remember as any}
                  />
                </span>
                Remember & Auto Login
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <Turnstile
                onError={() => setStatus('error')}
                onExpire={() => setStatus('expired')}
                onSuccess={(token) => {
                  setTokens(token);
                  setStatus('solved');
                }}
                options={{ theme: theme as any }}
                ref={turnstileRef}
                siteKey={siteKey as string}
              />
            </div>
            <div className="w-full text-left my-5">
              <button
                className={`w-full text-sm focus:outline-none text-white text-center font-semibold py-3 bg-green-500 rounded ${
                  status != 'solved' || formik.isSubmitting
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:bg-green-400'
                } `}
                disabled={formik.isSubmitting}
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
