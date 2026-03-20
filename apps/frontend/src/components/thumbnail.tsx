import { Logo } from '@/icons/logo';
import { NearLogo } from '@/icons/og';

type WrapperProps = {
  children: React.ReactNode;
  hideLogo?: boolean;
};

type TitleWrapperProps = {
  children: React.ReactNode;
};

type TitleProps = {
  children: React.ReactNode;
  small?: boolean;
};

type SubTitleProps = {
  children: React.ReactNode;
};

export const Wrapper = ({ children, hideLogo = false }: WrapperProps) => (
  <div
    style={{
      alignItems: 'center',
      background: '#0f5e59',
      color: 'white',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      paddingLeft: 64,
      paddingRight: 64,
      width: '100%',
    }}
  >
    {!hideLogo && (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          position: 'absolute',
          right: 24,
          top: 24,
        }}
      >
        <NearLogo
          style={{
            color: 'white',
            height: 94,
            width: 75,
          }}
        />
      </div>
    )}
    {!hideLogo && (
      <div
        style={{
          alignItems: 'center',
          bottom: 24,
          display: 'flex',
          left: 24,
          position: 'absolute',
        }}
      >
        <Logo style={{ color: 'white', height: 75, width: 375 }} />
      </div>
    )}
    {children}
  </div>
);

export const LogoFull = () => (
  <Logo style={{ color: 'white', height: 160, width: 800 }} />
);

export const TitleWrapper = ({ children }: TitleWrapperProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '100%',
      minWidth: '60%',
    }}
  >
    {children}
  </div>
);

export const Title = ({ children, small }: TitleProps) => (
  <div
    style={{
      fontFamily: 'Inter',
      fontSize: small ? 40 : 64,
      paddingLeft: 24,
      paddingRight: 24,
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

export const SubTitle = ({ children }: SubTitleProps) => (
  <div
    style={{
      fontFamily: 'Inter',
      fontSize: 64,
      overflow: 'hidden',
      paddingLeft: 24,
      paddingRight: 24,
      textAlign: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);
