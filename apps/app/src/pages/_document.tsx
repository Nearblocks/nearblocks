import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple_touch_icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon_32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon_16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/__ENV.js" />
      </Head>
      <body className="overflow-x-hidden   dark:bg-black-300">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
