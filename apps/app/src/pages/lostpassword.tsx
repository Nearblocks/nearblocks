import * as Yup from 'yup';
import Head from 'next/head';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import React, { ReactElement, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layouts';
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import { GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';

const title = 'Nearblocks';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
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
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
});

const ForgotPassword = () => {
  const router = useRouter();

  const [success, setSuccess] = useState(false);

  const onLogin = () => router.push('/login');
  const onResend = () => router.push('/resend?type=RESET_PASSWORD');

  const onSubmit = async (values: FormikValues) => {
    try {
      await request.post(`/forgot`, values);
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
                        onClick={onResend}
                        className="font-semibold cursor-pointer"
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
                  name="email"
                  autoComplete="off"
                  value={formik.values.email}
                  placeholder="Email address"
                  onChange={formik.handleChange}
                  className="border dark:text-neargray-10 px-3 w-full bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 h-12"
                />
                {formik.touched.email && formik.errors.email && (
                  <small className="text-red-500">{formik.errors.email}</small>
                )}
              </div>

              <div className="w-full text-right my-4 justify-between flex items-center">
                <a
                  onClick={onLogin}
                  className="underline text-xs text-gray-600 dark:text-neargray-10 cursor-pointer"
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
                      disabled={formik.isSubmitting}
                      type="submit"
                      onClick={() => formik.handleSubmit()}
                      className={`text-sm focus:outline-none text-white dark:text-neargray-100 text-center font-semibold p-3 bg-green-500 rounded ${
                        formik.isSubmitting
                          ? 'cursor-not-allowed opacity-60'
                          : 'hover:bg-green-400'
                      }`}
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

ForgotPassword.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default ForgotPassword;
