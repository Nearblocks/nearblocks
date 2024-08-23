import { unstable_setRequestLocale } from 'next-intl/server';

export default function BlockLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: any;
}) {
  unstable_setRequestLocale(locale);

  return children;
}

// import Layout from '@/app/_components/Layouts';
// import { NextIntlClientProvider } from 'next-intl';
// import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
// import { ThemeProvider } from 'next-themes';
// import Script from 'next/script';
// import { env } from 'next-runtime-env';
// import Head from 'next/head';
// import '../../../../public/common.css';

// interface paramTypes {
//   children: React.ReactNode;
//   params: { locale: string };
// }

// export default async function BlockLayout({
//   children,
//   params
// }: paramTypes) {
//   unstable_setRequestLocale(params.locale);
//   const messages = await getMessages();

//   return (
//     <html lang={params.locale}>
//       <Head>
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://fonts.gstatic.com" />
//         <link
//           href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&display=swap"
//           rel="stylesheet"
//         />
//         <link
//           rel="apple-touch-icon"
//           sizes="180x180"
//           href="/apple_touch_icon.png"
//         />
//         <link
//           rel="icon"
//           type="image/png"
//           sizes="32x32"
//           href="/favicon_32x32.png"
//         />
//         <link
//           rel="icon"
//           type="image/png"
//           sizes="16x16"
//           href="/favicon_16x16.png"
//         />
//         <link rel="manifest" href="/site.webmanifest" />
//         {/* eslint-disable-next-line @next/next/no-sync-scripts */}
//         <script src="/__ENV.js" />
//       </Head>
//       <body className="overflow-x-hidden dark:bg-black-300">
//         <Script id="gtm">
//           {`
//           (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
//           new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
//           j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
//           'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
//           })(window,document,'script','dataLayer','${env(
//             'NEXT_PUBLIC_GTM_ID',
//           )}');
//         `}
//         </Script>
//         <ThemeProvider attribute="class" enableSystem={false}>
//           {/* <VmInitializer /> */}
//           <NextIntlClientProvider messages={messages}>
//             <Layout>{children}</Layout>
//           </NextIntlClientProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
