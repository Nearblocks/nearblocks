import { ImageResponse } from 'next/og';

import { LogoFull, Wrapper } from '@/components/thumbnail';

export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

const Image = async () => {
  return new ImageResponse(
    (
      <Wrapper hideLogo>
        <LogoFull />
      </Wrapper>
    ),
    { ...size },
  );
};

export default Image;
