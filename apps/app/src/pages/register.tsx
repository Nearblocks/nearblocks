import * as Yup from 'yup';
import Head from 'next/head';
import Link from 'next/link';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import React, { ReactElement, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layouts';
import { request } from '@/hooks/useAuth';
import { catchErrors, removeProtocol } from '@/utils/libs';
import { GetServerSideProps } from 'next';
import { fetcher } from '@/hooks/useFetch';
import Visibility from '@/components/Icons/Visibility';
import VisibilityOff from '@/components/Icons/VisibilityOff';
import { appUrl } from '@/utils/config';

const title = `Register | Nearblocks`;

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .min(5, 'Username must be 5 character')
    .required('Please enter username'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  email_confirmation: Yup.string()
    .oneOf([Yup.ref('email'), null], 'Your email do not match')
    .required('Please enter  email confirmation'),
  password: Yup.string()
    .min(8, 'Password must be an 8 character')
    .required('Please enter  password'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Your passwords do not match')
    .required('Please enter password confirmation'),
  terms_conditions: Yup.bool().oneOf(
    [true],
    'Please accept our Terms and Conditions',
  ),
});

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async (context) => {
  const { req, res, query } = context;
  const { id, interval } = query;
  let token = req.cookies.token;

  try {
    // Redirection logic based on token and query parameters
    if (token) {
      if (id && interval) {
        res.writeHead(302, {
          Location: `/user/overview?id=${id}&interval=${interval}`,
        });
      } else {
        res.writeHead(302, {
          Location: `/user/overview`,
        });
      }
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

const Register = () => {
  const router = useRouter();
  const [verify, setverify] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({
    password1: false,
    password2: false,
  });

  const onSubmit = async (values: FormikValues) => {
    try {
      await request.post(`/register`, values);
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

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      email_confirmation: '',
      password: '',
      password_confirmation: '',
      terms_conditions: false,
    },
    onSubmit,
    validationSchema,
  });

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
            {!verify ? (
              <form method="post" onSubmit={formik.handleSubmit}>
                <h1 className="text-3xl text-green-500 dark:text-green-250 py-2 font-semibold">
                  Register a new account
                </h1>
                <p className="text-sm text-gray-600 dark:text-neargray-100 py-2 font-thin">
                  Fill out the form to get started.
                </p>
                <div className="py-2">
                  <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                    Username
                  </p>
                  <input
                    autoComplete="off"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue rounded-md h-12 dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                  />
                  {formik.touched.username && formik.errors.username && (
                    <small className="text-red-500">
                      {formik.errors.username}
                    </small>
                  )}
                </div>
                <div className="py-2">
                  <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                    Email Address
                  </p>
                  <input
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <small className="text-red-500">
                      {formik.errors.email}
                    </small>
                  )}
                </div>
                <div className="py-2">
                  <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                    Confirm Email Address
                  </p>
                  <input
                    autoComplete="off"
                    onPaste={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                    name="email_confirmation"
                    value={formik.values.email_confirmation}
                    onChange={formik.handleChange}
                    className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                  />
                  {formik.touched.email_confirmation &&
                    formik.errors.email_confirmation && (
                      <small className="text-red-500">
                        {formik.errors.email_confirmation}
                      </small>
                    )}
                </div>
                <div className="py-2 flex">
                  <div className="w-full mr-1">
                    <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                      Password
                    </p>
                    <div className="relative w-full">
                      <input
                        type={showPasswords.password1 ? 'text' : 'password'}
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                      />
                      <button
                        className="absolute top-0 right-0 h-full px-3"
                        onClick={(e) =>
                          togglePasswordVisibility(e, 'password1')
                        }
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
                    <p className="py-2 text-sm text-gray-600 dark:text-neargray-100">
                      Confirm Password
                    </p>
                    <div className="relative w-full">
                      <input
                        type={showPasswords.password2 ? 'text' : 'password'}
                        onPaste={(e) => {
                          e.preventDefault();
                          return false;
                        }}
                        name="password_confirmation"
                        value={formik.values.password_confirmation}
                        onChange={formik.handleChange}
                        className="border text-black-300 dark:text-white dark:border-black-200 dark:bg-black-300 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                      />
                      <button
                        className="absolute top-0 right-0 h-full px-3"
                        onClick={(e) =>
                          togglePasswordVisibility(e, 'password2')
                        }
                      >
                        {showPasswords.password2 ? (
                          <Visibility className="w-4 h-4" />
                        ) : (
                          <VisibilityOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formik.touched.password_confirmation &&
                      formik.errors.password_confirmation && (
                        <small className="text-red-500">
                          {formik.errors.password_confirmation}
                        </small>
                      )}
                  </div>
                </div>
                <div className="py-2">
                  <p className="text-sm text-gray-600 dark:text-neargray-100">
                    <span>
                      <input
                        type="checkbox"
                        checked={formik.values.terms_conditions}
                        onChange={(e) =>
                          formik.setFieldValue(
                            'terms_conditions',
                            e.target.checked,
                          )
                        }
                        className="mr-2"
                      />
                    </span>
                    I agree to the{' '}
                    <span className="underline">
                      <a href={`/terms-and-conditions`} target="_blank">
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
                    disabled={formik.isSubmitting}
                    type="submit"
                    onClick={() => formik.handleSubmit()}
                    className={`text-sm font-semibold focus:outline-none text-white text-center w-56 py-3 bg-green-500 rounded ${
                      formik.isSubmitting
                        ? 'cursor-not-allowed opacity-60'
                        : 'hover:bg-green-400'
                    } `}
                  >
                    Create account
                  </button>
                </div>
                <div className="py-2">
                  <p className="text-gray-600 dark:text-neargray-100 text-sm my-1">
                    <span className="font-thin">Already have an account?</span>{' '}
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
                <h1 className="text-3xl text-green-500 dark:text-green-250 py-4 font-semibold">
                  Register a new account
                </h1>
                <div className="bg-neargreen/5 dark:bg-blue-900/[0.05] text-sm text-green-500 dark:text-green-250 rounded-md px-4 py-3">
                  Your account registration has been submitted and is pending
                  email verification
                </div>
                <p className="text-sm dark:text-gray-300 my-6">
                  We have sent an email to {formik.values?.email} with a link to
                  activate your account. To complete the sign-up process, please
                  click on the confirmation link in the email.
                </p>
                <p className="text-sm dark:text-gray-300 my-6">
                  If you do not receive a confirmation email, please check your
                  spam folder and ensure your spam filters allow emails from
                  contact@ {removeProtocol(appUrl)}.
                </p>
                <p className="text-sm dark:text-gray-300 my-6">
                  If you dont get confirmation link, please{' '}
                  <a
                    onClick={onResend}
                    className="text-green-500 dark:text-green-250 font-medium cursor-pointer"
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
    </>
  );
};

Register.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default Register;
