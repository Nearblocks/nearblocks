'use client';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { FormikValues, useFormik } from 'formik';
import Cookies from 'js-cookie';
import get from 'lodash/get';
import { useEnvContext } from 'next-runtime-env';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import Visibility from '@/components/app/Icons/Visibility';
import VisibilityOff from '@/components/app/Icons/VisibilityOff';
import { request } from '@/hooks/app/useAuth';
import useStorage from '@/hooks/app/useStorage';
import { Link } from '@/i18n/routing';
import { catchErrors } from '@/utils/app/libs';

interface Props {
  id?: string;
  interval?: string;
  turnstileSiteAuth: (tokens: string) => any;
}

const Login = ({ id, interval, turnstileSiteAuth }: Props) => {
  const router = useRouter();
  const [, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [tokens, setTokens] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [updatePassMsg, setUpdatePassMsg] = useState('');
  const { theme } = useTheme();
  const { NEXT_PUBLIC_TURNSTILE_SITE_KEY: siteKey } = useEnvContext();

  const turnstileRef = useRef<TurnstileInstance>(null);
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .required('Please enter  password')
      .min(8, 'Password must be an 8 character'),
    usernameOrEmail: Yup.string().required('Please enter username'),
  });

  const resetStripePlan = () => {
    localStorage.removeItem('stripe-plan-id');
    localStorage.removeItem('interval');
    localStorage.removeItem('subscribe-called');
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

  useEffect(() => {
    if (id) {
      localStorage.setItem('stripe-plan-id', id as string);
      localStorage.setItem('interval', interval as string);
      localStorage.setItem('subscribe-called', '');
    } else {
      resetStripePlan();
    }
  }, [id, interval]);

  useEffect(() => {
    let hasRefreshed = false;
    const checkCookies = () => {
      const u = Cookies.get('user');
      if (u && !hasRefreshed) {
        hasRefreshed = true;
        router.refresh();
      }
    };
    checkCookies();
    const intervalId = setInterval(checkCookies, 1000);
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
        const res = await request.post(`login`, {
          password: values.password,
          username_or_email: values.usernameOrEmail,
        });

        if (
          res?.data?.meta?.token &&
          res?.data?.data?.role &&
          res?.data?.data?.username
        ) {
          setToken(res?.data?.meta?.token);
          setRole(res?.data?.data?.role[0].name);
          setUser(res?.data?.data?.username);
          Cookies.set('token', res?.data?.meta?.token, {
            expires: 30,
          });
          Cookies.set('role', res?.data?.data?.role[0].name, {
            expires: 30,
          });
          Cookies.set('user', res?.data?.data?.username, {
            expires: 30,
          });
          if (id && interval) {
            subscribePlan();
          } else {
            router.push('/user/overview');
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
              <p className="text-sm text-gray-600 dark:text-white font-thin">
                <span>
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
