'use client';
import { useTheme } from 'next-themes';
import Image from 'next/legacy/image';

export default function ThemeImage() {
  const { theme } = useTheme();

  return (
    <Image
      src={
        theme === 'dark'
          ? '/images/world-link-dark.svg'
          : '/images/world-link-light.svg'
      }
      alt="NearBlocks"
      className="w-full"
      width={1024}
      height={600}
    />
  );
}
