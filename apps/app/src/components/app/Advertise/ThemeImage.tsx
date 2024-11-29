'use client';

import { useTheme } from 'next-themes';
import Image from 'next/legacy/image';

export default function ThemeImage() {
  const { theme } = useTheme();

  return (
    <Image
      alt="NearBlocks"
      className="w-full"
      height={600}
      src={
        theme === 'dark'
          ? '/images/world-link-dark.svg'
          : '/images/world-link-light.svg'
      }
      width={1024}
    />
  );
}
