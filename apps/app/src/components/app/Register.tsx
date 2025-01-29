'use client';
import { FormikValues, useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import Visibility from '@/components/app/Icons/Visibility';
import VisibilityOff from '@/components/app/Icons/VisibilityOff';
import { request } from '@/hooks/app/useAuth';
import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import { removeProtocol } from '@/utils/app/libs';
import { catchErrors } from '@/utils/app/libs';

export const Register = () => {
  const [verify, setverify] = useState(false);
  const { userAuthURL: baseURL } = useConfig();
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({
    password1: false,
    password2: false,
  });
  const router = useRouter();
  const { appUrl } = useConfig();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Please enter a valid email')
      .required('Please enter email'),
    confirm_email: Yup.string()
      .oneOf([Yup.ref('email')], 'Your email do not match')
      .required('Please enter  email confirmation'),
    password: Yup.string()
      .min(8, 'Password must be an 8 character')
      .required('Please enter  password'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password')], 'Your passwords do not match')
      .required('Please enter password confirmation'),
    terms_conditions: Yup.bool().oneOf(
      [true],
      'Please accept our Terms and Conditions',
    ),
    username: Yup.string()
      .min(5, 'Username must be 5 character')
      .required('Please enter username'),
  });

  const onResend = () => router.push('/resend');

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
      await request(baseURL).post(`/register`, values);
      setverify(true);
    } catch (error: any) {
      const errors = error?.response?.data?.error;
      if (errors) {
        if (!toast.isActive('register-error')) {
          toast.error(errors, {
            toastId: 'register-error',
          });
        }
      } else {
        const message = catchErrors(error);
        if (!toast.isActive('register-error')) {
          toast.error(message, {
            toastId: 'register-error',
          });
        }
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      confirm_email: '',
      password: '',
      confirm_password: '',
      terms_conditions: false,
      username: '',
    },
    onSubmit,
    validationSchema,
  });

  return (
    <section>
      <div className="container-xxl mx-auto py-20">
        <div className="mx-auto px-5 align-middle max-w-[685px]">
          {!verify ? (
            <form method="post" onSubmit={formik.handleSubmit}>
              <h1 className="text-2xl text-green-500 dark:text-green-250 py-2 font-semibold">
                Register a new account
              </h1>
              <p className="text-gray-600 text-sm  font-medium dark:text-white  py-2">
                Fill out the form to get started.
              </p>
              <div className="py-2">
                <p className="py-2 text-sm font-medium text-black-600 dark:text-neargray-100">
                  Username
                </p>
                <input
                  autoComplete="off"
                  className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue rounded-md h-12 dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                  name="username"
                  onChange={formik.handleChange}
                  value={formik.values.username}
                />
                {formik.touched.username && formik.errors.username && (
                  <small className="text-red-500">
                    {formik.errors.username}
                  </small>
                )}
              </div>
              <div className="py-2">
                <p className="py-2 text-sm font-medium text-black-600 dark:text-neargray-100">
                  Email Address
                </p>
                <input
                  className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                  name="email"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <small className="text-red-500">{formik.errors.email}</small>
                )}
              </div>
              <div className="py-2">
                <p className="py-2 text-sm font-medium text-black-600 dark:text-neargray-100">
                  Confirm Email Address
                </p>
                <input
                  autoComplete="off"
                  className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                  name="confirm_email"
                  onChange={formik.handleChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  value={formik.values.confirm_email}
                />
                {formik.touched.confirm_email &&
                  formik.errors.confirm_email && (
                    <small className="text-red-500">
                      {formik.errors.confirm_email}
                    </small>
                  )}
              </div>
              <div className="py-2 flex">
                <div className="w-full mr-1">
                  <p className="py-2 text-sm font-medium text-black-600 dark:text-neargray-100">
                    Password
                  </p>
                  <div className="relative w-full">
                    <input
                      className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
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
                      className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                      name="confirm_password"
                      onChange={formik.handleChange}
                      onPaste={(e) => {
                        e.preventDefault();
                        return false;
                      }}
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
              <div className="py-2">
                <p className="text-sm font-medium text-gray-600 dark:text-white flex">
                  <span className="flex">
                    <input
                      checked={formik.values.terms_conditions}
                      className="mr-2"
                      onChange={(e) =>
                        formik.setFieldValue(
                          'terms_conditions',
                          e.target.checked,
                        )
                      }
                      type="checkbox"
                    />
                  </span>
                  I agree to the
                  <span className="underline">
                    <a
                      className="ml-1"
                      href={`/terms-and-conditions`}
                      target="_blank"
                    >
                      <span>Terms and Conditions</span>
                    </a>
                  </span>
                </p>
                {formik.touched.terms_conditions &&
                  formik.errors.terms_conditions && (
                    <small className="text-red-500">
                      {formik.errors.terms_conditions}
                    </small>
                  )}
              </div>
              <div className="w-full text-left my-2">
                <button
                  className={`text-sm font-semibold focus:outline-none text-white text-center w-56 py-3 bg-green-500 rounded ${
                    formik.isSubmitting
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:bg-green-400'
                  } `}
                  disabled={formik.isSubmitting}
                  onClick={() => formik.handleSubmit()}
                  type="submit"
                >
                  Create account
                </button>
              </div>
              <div className="py-2">
                <p className="text-gray-600 text-sm  font-medium dark:text-white my-1">
                  <span>Already have an account?</span>{' '}
                  <span className="text-green-500 dark:text-green-250 ">
                    <Link href="/login">
                      <span> Click to Sign In</span>
                    </Link>
                  </span>
                </p>
              </div>
            </form>
          ) : (
            <div>
              <h1 className="text-2xl text-green-500 dark:text-green-250 py-4 font-semibold">
                Register a new account
              </h1>
              <div className="bg-neargreen/5 dark:bg-blue-900/[0.05] text-sm text-green-500 dark:text-green-250 rounded-md px-4 py-3">
                Your account registration has been submitted and is pending
                email verification
              </div>
              <p className="text-sm text-black-600 dark:text-neargray-100 my-6">
                We have sent an email to {formik.values?.email} with a link to
                activate your account. To complete the sign-up process, please
                click on the confirmation link in the email.
              </p>
              <p className="text-sm text-black-600 dark:text-neargray-100 my-6">
                If you do not receive a confirmation email, please check your
                spam folder and ensure your spam filters allow emails from
                contact@ {removeProtocol(appUrl)}.
              </p>
              <p className="text-sm text-black-600 dark:text-neargray-100 my-6">
                If you dont get confirmation link, please{' '}
                <a
                  className="text-green-500 dark:text-green-250 font-medium cursor-pointer"
                  onClick={onResend}
                >
                  resend
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default Register;
