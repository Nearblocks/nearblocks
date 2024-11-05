'use client';
import Cookies from 'js-cookie';
import Image from 'next/legacy/image';

export default function ThemeImage() {
  const theme = Cookies?.get('theme') || 'light';

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
