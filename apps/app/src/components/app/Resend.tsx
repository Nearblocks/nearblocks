'use client';
import { FormikValues, useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { request } from '@/hooks/app/useAuth';
import { useConfig } from '@/hooks/app/useConfig';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
});

interface Props {
  type?: string;
}

const Resend = ({ type }: Props) => {
  const router = useRouter();
  const { userAuthURL: baseURL } = useConfig();
  const onLogin = () => router.push('/login');
  const onSubmit = async (values: FormikValues) => {
    try {
      const data = { ...values, type };
      await request(baseURL).post(`/resend`, data);
      if (!toast.isActive('resent-email')) {
        toast.success('Email resent successfully', {
          toastId: 'resent-email',
        });
      }
      formik.resetForm();
    } catch (error: any) {
      const message = error?.response?.data?.errors[0]?.message;
      if (message) {
        if (!toast.isActive('resent-email-error')) {
          toast.error(message, {
            toastId: 'resent-email-error',
          });
        }
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: onSubmit,
    validationSchema: validationSchema,
  });

  return (
    <section>
      <div className="container-xxl mx-auto py-20">
        <div className="mx-auto px-5 align-middle max-w-[685px]">
          <form method="post" onSubmit={formik.handleSubmit}>
            {type && type === 'RESET_PASSWORD' ? (
              <h1 className="text-3xl text-green-500 dark:text-green-250 py-2 font-semibold">
                Resend Password Recovery{' '}
                <span className="font-bold">Email</span>
              </h1>
            ) : (
              <h1 className="text-3xl text-green-500 dark:text-green-250 py-2 font-semibold">
                Resend Confirmation <span className="font-bold">Email</span>
              </h1>
            )}
            <div className="py-2">
              <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                Email Address
              </p>
              <input
                autoComplete="off"
                className="border text-black-300 dark:text-white dark:border-black-200 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                name="email"
                onChange={formik.handleChange}
                placeholder="Enter your email address here"
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
              <button
                className={`text-sm focus:outline-none bg-green-500 text-white text-center font-semibold w-56 py-3 rounded ${
                  formik.isSubmitting
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:bg-green-400'
                } `}
                disabled={formik.isSubmitting}
                onClick={() => formik.handleSubmit()}
                type="submit"
              >
                Send Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Resend;
