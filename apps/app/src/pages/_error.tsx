import type { NextPageContext } from 'next';

type ErrorProps = {
  statusCode?: number;
};

function ErrorPage({ statusCode }: ErrorProps) {
  const code = statusCode ?? 500;
  const message =
    code === 404
      ? 'This page could not be found.'
      : 'An unexpected error has occurred.';

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold text-nearblue-600 dark:text-neargray-10">
        {code}
      </h1>
      <p className="mt-3 text-nearblue-600 dark:text-neargray-10">{message}</p>
      <a
        className="mt-6 inline-flex rounded bg-green-500 px-3 py-2 text-xs text-white hover:bg-green-200"
        href="/"
      >
        Go back home
      </a>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
