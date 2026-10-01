import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link href="/favicon.ico" rel="icon" />
        <link href="/site.webmanifest" rel="manifest" />
        <script src="/__ENV.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
