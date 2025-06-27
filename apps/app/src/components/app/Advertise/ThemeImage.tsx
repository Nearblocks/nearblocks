'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';

export default function ThemeImage({ theme: cookieTheme }: { theme: string }) {
  let { theme } = useTheme();

  if (theme == undefined) {
    theme = cookieTheme;
  }

  return (
    <Image
      alt="NearBlocks"
      className="w-full"
      height={600}
      loading="eager"
      src={
        theme === 'dark'
          ? '/images/world-link-dark.svg'
          : '/images/world-link-light.svg'
      }
      width={1024}
    />
  );
}
