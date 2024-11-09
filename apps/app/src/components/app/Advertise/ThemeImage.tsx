'use client';
import Cookies from 'js-cookie';
import Image from 'next/legacy/image';

export default function ThemeImage() {
  const theme = Cookies?.get('theme') || 'light';

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
