import { SVGProps } from 'react';

const CaretDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M4.182 6.182a.45.45 0 01.636 0L7.5 8.864l2.682-2.682a.45.45 0 01.636.636l-3 3a.45.45 0 01-.636 0l-3-3a.45.45 0 010-.636z" />
  </svg>
);

export default CaretDown;
