import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html className="light" lang="en">
      <Head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function initTheme() {
                var theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `(function(w,l){` +
              `w[l] = w[l] || [];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});` +
              `})(window,'dataLayer');`,
          }}
        />
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
