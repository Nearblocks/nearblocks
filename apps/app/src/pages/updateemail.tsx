import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
/* import { useAccount } from "wagmi"; */
import Cookies from 'js-cookie';
import Layout from '@/components/Layouts';
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import useStorage from '@/hooks/useStorage';
import { GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';

const title = 'Nearblocks';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
  status: number | null;
  message: string | null;
  authToken: string | null;
  authUserRole: string | null;
  authUsername: string | null;
}> = async (context) => {
  let status = null;
  let message = null;
  let token = null;
  let role = null;
  let username = null;

  const {
    query: { email, code },
  } = context;

  try {
    const resp = await request.post(`/profile/update-email`, {
      email: email,
      code: code,
    });
    if (
      resp?.data?.meta?.token &&
      resp?.data?.data?.role &&
      resp?.data?.data?.username
    ) {
      token = resp?.data?.meta?.token;
      role = resp?.data?.data?.role[0].name;
      username = resp?.data?.data?.username;
    }
    status = resp?.status;
  } catch (error: any) {
    message = catchErrors(error);
    status = error?.response?.status;
  }

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
        status,
        message,
        authToken: token,
        authUserRole: role,
        authUsername: username,
      },
    };
  } catch (error) {
    console.error('Error fetching charts or blocks:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
        status,
        message,
        authToken: token,
        authUserRole: role,
        authUsername: username,
      },
    };
  }
};

interface Props {
  status: number;
  authToken: string;
  authUserRole: string;
  authUsername: string;
}

const UpdateEmail = ({
  status,
  authToken,
  authUserRole,
  authUsername,
}: Props) => {
  /*  const { isConnected } = useAccount(); */
  const router = useRouter();
  const [, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');
  /*  const onLogin = () => router.push("/login"); */
  const onResend = () => router.push('/respend');

  useEffect(() => {
    if (authToken && authUserRole && authUsername) {
      setToken(authToken);
      setRole(authUserRole);
      setUser(authUsername);
      Cookies.set('token', authToken);

      setTimeout(() => {
        router.replace('/user/overview');
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
      </Head>
      <section>
        <div className="container mx-auto">
          <div className="mx-auto px-5 align-middle max-w-[685px]">
            {[200, 204].includes(status) && (
              <div className="py-36">
                <h1 className="text-3xl text-green-500 dark:text-green-250 py-4 text-center">
                  Changed Your Email
                </h1>
                <div className="bg-blue-200/30 dark:bg-blue-200/5 text-green-500 dark:text-green-250 rounded-md px-5 py-5">
                  <span className="font-bold">Congratulations!</span> Your email
                  is succcessfully verfied. Enjoy your {title} services
                </div>
                {/* {!isConnected && (
                  <div className="w-full text-right my-4">
                    <button
                      onClick={onLogin}
                      type="button"
                      className="text-sm text-white  text-center font-semibold w-56 py-3 bg-green-500 rounded"
                    >
                      Back to Login
                    </button>
                  </div>
                )} */}
              </div>
            )}
            {[422, 400].includes(status) && (
              <div className="py-28">
                <h1 className="text-3xl text-green-500 dark:text-green-250 py-4 text-center">
                  Verification Failed
                </h1>
                <div className="bg-red-50 text-red-500 dark:bg-red-500/[0.10] text-sm rounded-md px-5 py-5">
                  <span className="font-bold">Oops!</span> Invalid confirmation
                  link. Please confirm you entered the correct URL or click on
                  the button below to resend the confirmation link.
                </div>

                <div className="w-full text-right my-4 justify-between flex items-center">
                  {/*  {!isConnected && (
                    <a
                      onClick={onLogin}
                      className="underline text-xs text-gray-400 cursor-pointer"
                    >
                      Back to Login
                    </a>
                  )} */}
                  <button
                    onClick={onResend}
                    type="button"
                    className="text-sm text-white  text-center font-semibold w-56 py-3 hover:bg-green-400 bg-green-500 rounded"
                  >
                    Resend
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

UpdateEmail.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default UpdateEmail;
