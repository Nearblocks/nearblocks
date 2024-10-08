import '@/styles/globals.css';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import '../../public/common.css';
import { Manrope } from 'next/font/google';
import { unstable_setRequestLocale } from 'next-intl/server';

interface paramTypes {
  children: React.ReactNode;
  params: { locale: string };
}

const manrope = Manrope({
  weight: ['200', '300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
});

export default async function RootLayout({
  children,
  params: { locale },
}: paramTypes) {
  unstable_setRequestLocale(locale);

  return (
    <html className={manrope.className} suppressHydrationWarning lang="en">
      <head>
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
        <script async src="/__ENV.js" />
      </head>
      <body className="overflow-x-hidden dark:bg-black-300">
        <Script async id="gtm">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `}
        </Script>
        <ThemeProvider attribute="class" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

export const revalidate = 5;
