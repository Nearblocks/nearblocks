import React, { ReactElement } from 'react';
import * as Yup from 'yup';
import Head from 'next/head';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Layout from '@/components/Layouts';
import { request } from '@/hooks/useAuth';
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

const ResendEmail = () => {
  const router = useRouter();
  const { type } = router.query;

  const onLogin = () => router.push('/login');

  const onSubmit = async (values: FormikValues) => {
    try {
      const data = { ...values, type };
      await request.post(`/resend`, data);
      if (!toast.isActive('resent-email')) {
        toast.success('Email resent successfully', {
          toastId: 'resent-email',
        });
      }
      formik.resetForm();
    } catch (error: any) {
      const message = error?.response?.data?.errors?.email[0];
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
                  name="email"
                  autoComplete="off"
                  value={formik.values.email}
                  placeholder="Enter your email address here"
                  onChange={formik.handleChange}
                  className="border text-black-300 dark:text-white dark:border-black-200 px-3 w-full focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded-md h-12"
                />
                {formik.touched.email && formik.errors.email && (
                  <small className="text-red-500">{formik.errors.email}</small>
                )}
              </div>

              <div className="w-full text-right my-4 justify-between flex items-center">
                <a
                  onClick={onLogin}
                  className="underline text-xs text-gray-600 dark:text-neargray-100 cursor-pointer"
                >
                  Back to sign in
                </a>
                <button
                  disabled={formik.isSubmitting}
                  type="submit"
                  onClick={() => formik.handleSubmit()}
                  className={`text-sm focus:outline-none bg-green-500 text-white text-center font-semibold w-56 py-3 rounded ${
                    formik.isSubmitting
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:bg-green-400'
                  } `}
                >
                  Send Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

ResendEmail.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default ResendEmail;
