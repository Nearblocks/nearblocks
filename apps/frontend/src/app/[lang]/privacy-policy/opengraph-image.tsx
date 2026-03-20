import { ImageResponse } from 'next/og';

import { Title, Wrapper } from '@/components/thumbnail';
import { Background } from '@/icons/og';

export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

const Image = async () => {
  return new ImageResponse(
    (
      <Wrapper>
        <Title>Privacy Policy</Title>
        <Background
          style={{
            height: 540,
            opacity: 0.05,
            position: 'absolute',
            width: 540,
          }}
        />
      </Wrapper>
    ),
    { ...size },
  );
};

export default Image;
