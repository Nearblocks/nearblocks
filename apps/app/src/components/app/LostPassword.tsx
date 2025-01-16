'use client';
import { FormikValues, useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { request } from '@/hooks/app/useAuth';
import { catchErrors } from '@/utils/app/libs';
import { useConfig } from '@/hooks/app/useConfig';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
});

const LostPassword = () => {
  const router = useRouter();

  const [success, setSuccess] = useState(false);
  const { userAuthURL: baseURL } = useConfig();

  const onLogin = () => router.push('/login');
  const onResend = () => router.push('/resend?type=RESET_PASSWORD');

  const onSubmit = async (values: FormikValues) => {
    try {
      await request(baseURL).post(`/forgot`, values);
      setSuccess(true);
    } catch (error: any) {
      const errors = error?.response?.data?.errors[0];
      if (errors) {
        const message = catchErrors(errors);
        if (!toast.isActive('forgot-pwd-error')) {
          toast.error(message, {
            toastId: 'forgot-pwd-error',
          });
        }
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit,
    validationSchema,
  });

  return (
    <>
      <section>
        <div className="container-xxl mx-auto py-20">
          <div className="mx-auto px-5 align-middle max-w-[685px]">
            <form method="post" onSubmit={formik.handleSubmit}>
              <h1 className="text-3xl text-green-500 dark:text-green-250 py-2 font-semibold">
                Forgot your password?
              </h1>
              <p className="text-gray-600 dark:text-neargray-10 text-xs my-2">
                Enter your email address below and we&apos;ll get you back on
                track.
              </p>

              {success && (
                <div className="bg-neargreen/5 dark:bg-black-200 text-green dark:text-neargreen-200 px-4 py-4 rounded-md mt-4">
                  <h2 className="text-lg my-1 font-medium">
                    You&apos;ve successfully requested a forgot password.
                  </h2>
                  <p className="text-sm my-2">
                    If the email address belongs to a known account, a recovery
                    password will be sent to you within the next few minutes.
                  </p>
                  <ul className="list-disc ml-4 pl-4">
                    <li className="text-sm my-2">
                      If you have yet to receive the &quot;Password
                      Recovery&quot; email, please check your spam/junk email
                      folders
                    </li>
                    <li className="text-sm my-2">
                      Or please{' '}
                      <a
                        className="font-semibold cursor-pointer"
                        onClick={onResend}
                      >
                        resend
                      </a>
                    </li>
                  </ul>
                </div>
              )}

              <div className="py-2">
                <p className="py-2 text-sm text-gray-600 dark:text-neargray-10">
                  Email Address
                </p>
                <input
                  autoComplete="off"
                  className="border dark:text-neargray-10 px-3 w-full bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 h-12"
                  name="email"
                  onChange={formik.handleChange}
                  placeholder="Email address"
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <small className="text-red-500">{formik.errors.email}</small>
                )}
              </div>

              <div className="w-full text-right my-4 justify-between flex items-center">
                <a
                  className="underline text-xs text-gray-600 dark:text-neargray-10 cursor-pointer"
                  onClick={onLogin}
                >
                  Back to sign in
                </a>
                <div>
                  {success && (
                    <button
                      className="text-[13px] mx-1 focus:outline-none text-white dark:text-neargray-100 text-center dark:bg-green-400 dark:hover:bg-green-300 bg-green-500 hover:bg-green-400 font-semibold px-3 py-2 rounded"
                      onClick={onResend}
                    >
                      Resend
                    </button>
                  )}
                  {!success && (
                    <button
                      className={`text-sm focus:outline-none text-white dark:text-neargray-100 text-center font-semibold p-3 bg-green-500 rounded ${
                        formik.isSubmitting
                          ? 'cursor-not-allowed opacity-60'
                          : 'hover:bg-green-400'
                      }`}
                      disabled={formik.isSubmitting}
                      onClick={() => formik.handleSubmit()}
                      type="submit"
                    >
                      Reset Password
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default LostPassword;
