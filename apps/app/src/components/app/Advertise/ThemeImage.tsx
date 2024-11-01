'use client';
import { useThemeStore } from '@/stores/theme';
import Image from 'next/legacy/image';

export default function ThemeImage() {
  const theme = useThemeStore((store) => store.theme);

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
