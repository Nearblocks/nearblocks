import React, { ReactElement } from 'react';
import * as Yup from 'yup';
import Head from 'next/head';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Layout from '@/components/Layouts';
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import { GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';

const title = `Register | Nearblocks`;

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be an 8 character')
    .required('Please enter  password'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Your passwords do not match')
    .required('Please enter password confirmation'),
});

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
  email: any;
  code: any;
}> = async (context) => {
  const {
    query: { email, code },
  } = context;
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
        email: email || null,
        code: code || null,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
        email: email || null,
        code: code || null,
      },
    };
  }
};

interface Props {
  email: string | null;
  code: string | null;
}

const ResetPassword = ({ email, code }: Props) => {
  const router = useRouter();

  const onSubmit = async (values: FormikValues) => {
    try {
      await request.post(`/reset`, values);
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
      email: email,
      code: code,
      password: '',
      password_confirmation: '',
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
              <h1 className="text-3xl text-primary py-2 font-semibold">
                Reset new Password
              </h1>
              <p className="text-sm text-gray-400 py-2 font-thin">
                Fill out the form
              </p>
              <div className="py-2 flex">
                <div className="w-full mr-1">
                  <p className="py-2 text-sm text-gray-500">Password</p>
                  <input
                    type="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    className="border dark:border-black-200 dark:bg-black-300 px-3 w-full outline-primary rounded-md h-12"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <small className="text-red-500">
                      {formik.errors.password}
                    </small>
                  )}
                </div>
                <div className="w-full ml-2">
                  <p className="py-2 text-sm text-gray-500">Confirm Password</p>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formik.values.password_confirmation}
                    onChange={formik.handleChange}
                    className="border dark:border-black-200 dark:bg-black-300 px-3 w-full outline-primary rounded-md h-12"
                  />
                  {formik.touched.password_confirmation &&
                    formik.errors.password_confirmation && (
                      <small className="text-red-500">
                        {formik.errors.password_confirmation}
                      </small>
                    )}
                </div>
              </div>

              <div className="w-full text-right my-4 justify-between flex items-center">
                <a
                  onClick={onLogin}
                  className="underline text-xs text-gray-400 cursor-pointer"
                >
                  Back to sign in
                </a>
                <button
                  disabled={formik.isSubmitting}
                  type="submit"
                  onClick={() => formik.handleSubmit()}
                  className={`text-sm  focus:outline-none text-white  text-center font-semibold w-56 py-3 bg-primary rounded ${
                    formik.isSubmitting && 'cursor-not-allowed bg-primary-100'
                  } `}
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

ResetPassword.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default ResetPassword;
