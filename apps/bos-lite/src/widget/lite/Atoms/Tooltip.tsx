import type { ReactNode } from 'react';

export type TooltipProps = {
  children: ReactNode;
  tooltip: ReactNode;
};

const TooltipContainer = styled.span`
  position: relative;
`;

const TooltipText = styled.span`
  position: absolute;
  z-index: 50;
  left: 50%;
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  max-width: 200px;
  background-color: rgb(var(--color-bg-tooltip));
  color: rgb(var(--color-text-tooltip));
  font-size: 0.75rem;
  line-height: 1rem;
  overflow-wrap: break-word;
  border-radius: 0.5rem;
  padding: 0.5rem;
  transition:
    opacity 0.3s,
    bottom 0.3s;
  transition-property: bottom;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  visibility: hidden;
  bottom: 80%;
  opacity: 0;

  ${TooltipContainer}:hover & {
    visibility: visible;
    bottom: 100%;
    opacity: 1;
  }
`;

const TooltipArrow = styled.span`
  position: absolute;
  left: 50%;
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  width: 0px;
  width: 0px;
  border-color: transparent;
  border-top-color: rgb(var(--color-bg-tooltip));
  border-width: 4px;
  border-bottom-width: 0px;
  transition:
    opacity 0.3s,
    bottom 0.3s;
  transition-property: top;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  visibility: hidden;
  top: 20%;
  opacity: 0;

  ${TooltipContainer}:hover & {
    visibility: visible;
    top: -0%;
    opacity: 1;
  }
`;

const Content = styled.span``;

const Tooltip = ({ children, tooltip }: TooltipProps) => {
  return (
    <TooltipContainer>
      <TooltipText>{tooltip}</TooltipText>
      <TooltipArrow />
      <Content>{children}</Content>
    </TooltipContainer>
  );
};

export default Tooltip;
