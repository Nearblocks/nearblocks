'use client';
import { FormikValues } from 'formik';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import Visibility from '@/components/app/Icons/Visibility';
import VisibilityOff from '@/components/app/Icons/VisibilityOff';
import { request } from '@/hooks/app/useAuth';
import { catchErrors } from '@/utils/app/libs';
import { useConfig } from '@/hooks/app/useConfig';

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be an 8 character')
    .required('Please enter  password'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password')], 'Your passwords do not match')
    .required('Please enter password confirmation'),
});

interface Props {
  code?: string;
  email?: string;
}

const Reset = ({ code, email }: Props) => {
  const router = useRouter();
  const { userAuthURL: baseURL } = useConfig();
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({
    password1: false,
    password2: false,
  });

  const togglePasswordVisibility = (
    e: React.MouseEvent<HTMLButtonElement>,
    input: string,
  ) => {
    e.preventDefault();
    setShowPasswords((prevState) => ({
      ...prevState,
      [input]: !prevState[input],
    }));
  };

  const onSubmit = async (values: FormikValues) => {
    try {
      await request(baseURL).post(`/reset`, values);
      if (!toast.isActive('password-reset')) {
        toast.success('Password reset successfully', {
          toastId: 'password-reset',
        });
      }
      router.push('/login');
    } catch (error: any) {
      const errors = error?.response?.data?.error;
      if (errors) {
        if (!toast.isActive('password-reset-error')) {
          toast.error(errors, {
            toastId: 'password-reset-error',
          });
        }
      } else {
        const message = catchErrors(error);
        if (!toast.isActive('password-reset-error')) {
          toast.error(message, {
            toastId: 'password-reset-error',
          });
        }
      }
    }
  };

  const onLogin = () => router.push('/login');

  const formik = useFormik({
    initialValues: {
      code: code,
      email: email,
      password: '',
      confirm_password: '',
    },
    onSubmit,
    validationSchema,
  });
  return (
    <section>
      <div className="container-xxl mx-auto py-20">
        <div className="mx-auto px-5 align-middle max-w-[685px]">
          <form method="post" onSubmit={formik.handleSubmit}>
            <h1 className="text-2xl text-green-500 dark:text-green-250 py-2 font-semibold">
              Reset new Password
            </h1>
            <p className="text-gray-600 dark:text-neargray-10 text-sm font-medium py-2">
              Fill out the form
            </p>
            <div className="py-2 flex">
              <div className="w-full mr-1">
                <p className="py-2 text-sm font-medium text-black-600 dark:text-neargray-100">
                  Password
                </p>
                <div className="relative w-full">
                  <input
                    className="border text-black-300 dark:text-white px-3 w-full h-12 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                    name="password"
                    onChange={formik.handleChange}
                    type={showPasswords.password1 ? 'text' : 'password'}
                    value={formik.values.password}
                  />
                  <button
                    className="absolute top-0 right-0 h-full px-3"
                    onClick={(e) => togglePasswordVisibility(e, 'password1')}
                  >
                    {showPasswords.password1 ? (
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
              <div className="w-full ml-2">
                <p className="py-2 text-sm font-medium text-black-600 dark:text-neargray-100">
                  Confirm Password
                </p>
                <div className="relative w-full">
                  <input
                    className="border text-black-300 dark:text-white px-3 w-full h-12 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                    name="confirm_password"
                    onChange={formik.handleChange}
                    type={showPasswords.password2 ? 'text' : 'password'}
                    value={formik.values.confirm_password}
                  />
                  <button
                    className="absolute top-0 right-0 h-full px-3"
                    onClick={(e) => togglePasswordVisibility(e, 'password2')}
                  >
                    {showPasswords.password2 ? (
                      <Visibility className="w-4 h-4" />
                    ) : (
                      <VisibilityOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formik.touched.confirm_password &&
                  formik.errors.confirm_password && (
                    <small className="text-red-500">
                      {formik.errors.confirm_password}
                    </small>
                  )}
              </div>
            </div>

            <div className="w-full text-right my-4 justify-between flex items-center">
              <a
                className="underline text-sm font-medium text-gray-600 dark:text-neargray-100 cursor-pointer"
                onClick={onLogin}
              >
                Back to sign in
              </a>
              <button
                className={`text-sm  focus:outline-none text-white  text-center font-semibold w-56 py-3 bg-green-500 rounded ${
                  formik.isSubmitting
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:bg-green-400'
                } `}
                disabled={formik.isSubmitting}
                onClick={() => formik.handleSubmit()}
                type="submit"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Reset;
