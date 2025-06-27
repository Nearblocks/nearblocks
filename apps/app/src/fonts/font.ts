import { Manrope, Space_Mono } from 'next/font/google';

export const manrope = Manrope({
  display: 'swap',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
});

export const space_mono = Space_Mono({
  display: 'swap',
  style: 'normal',
  subsets: ['latin'],
  weight: ['400', '700'],
});
