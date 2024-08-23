// // import { notFound } from 'next/navigation';
// import { getRequestConfig } from 'next-intl/server';

// const locales = [
//   'en',
//   'kr',
//   'id',
//   'zh-cn',
//   'zh-hk',
//   'ua',
//   'ru',
//   'es',
//   'vi',
//   'ph',
//   'fr',
//   'jp',
//   'th',
//   'it',
// ];

// export default getRequestConfig(async (params: { locale: string }) => {
//   // Validate that the incoming `locale` parameter is valid
//   // if (!locales.includes(params.locale)) notFound();

//   // Import the translations for the blocks namespace

//   const blocks = await import(
//     `nearblock-trans-next-intl/${params.locale}/blocks.json`
//   );
//   const common = await import(
//     `nearblock-trans-next-intl/${params.locale}/common.json`
//   );

//   return {
//     locales,
//     defaultLocale: 'en',
//     localeDetection: false, // Disable automatic locale detection
//     messages: {
//       ...blocks,
//       ...common,
//     },
//   };
// });
