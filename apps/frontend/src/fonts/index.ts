import localFont from 'next/font/local';

// Self-hosted (latin subset, variable weight) so builds never fetch Google Fonts;
// Turbopack's next/font/google fails on some of the CSS Google serves to CI runners.
export const roboto = localFont({
  src: './roboto-latin.woff2',
  variable: '--font-roboto',
  weight: '300 700',
});

export const geist = localFont({
  src: './geist-mono-latin.woff2',
  variable: '--font-geist',
  weight: '100 900',
});
