import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

const Document = () => {
  return (
    <Html className="light" lang="en">
      <Head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="/apple_touch_icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon_32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon_16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
      </Head>
      <body className="bg-bg-body bg-bg-gradient dark:bg-none bg-cover bg-no-repeat selection:bg-primary selection:text-[white] relative min-h-dvh overflow-x-hidden">
        <Main />
        <NextScript />
        <Script
          dangerouslySetInnerHTML={{
            __html: `(function initTheme() {
                var theme = localStorage.getItem('theme') || 'light'
                if (theme === 'dark') {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              })();`,
          }}
          id="theme-script"
          strategy="beforeInteractive"
        />
        <Script src="/__ENV.js" strategy="beforeInteractive" />
      </body>
    </Html>
  );
};

export default Document;
