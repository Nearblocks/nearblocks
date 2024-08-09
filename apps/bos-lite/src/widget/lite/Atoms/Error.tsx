import type { IconProps } from '@/types/types';

export type ErrorProps = {
  text?: string;
  title: string;
};

let ErrorIconSkeleton = window?.ErrorIconSkeleton || (() => <></>);

const ErrorContainer = styled.div`
  position: relative;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  @media (min-width: 1024px) {
    max-width: 1024px;
  }
  @media (min-width: 1280px) {
    max-width: 1072px;
  }
`;
const ErrorInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  .icon-class {
    color: rgb(var(--color-text-warning));
    width: 3rem /* 48px */;
    margin-bottom: 0.5rem /* 8px */;
  }
`;
const ErrorTitle = styled.h1`
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.75rem;
  text-align: center;
  letter-spacing: 0.1px;
`;

const ErrorText = styled.p`
  color: rgb(var(--color-text-label));
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: center;
  margin-top: 0.25rem;
`;

const Error = ({ text, title }: ErrorProps) => {
  return (
    <ErrorContainer>
      <ErrorInnerContainer>
        <Widget<IconProps>
          key="warning-icon"
          loading={<ErrorIconSkeleton />}
          props={{ className: 'icon-class' }}
          src={`${config_account}/widget/lite.Icons.Warning`}
        />
        <ErrorTitle>{title}</ErrorTitle>
        <ErrorText>
          {text ?? 'Please try again or try changing the RPC endpoint'}
        </ErrorText>
      </ErrorInnerContainer>
    </ErrorContainer>
  );
};

export default Error;
