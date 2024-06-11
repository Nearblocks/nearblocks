import { SVGProps } from 'react';

const Receipt = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M9 4L6 2 3 4v15a3 3 0 003 3h14a3 3 0 003-3v-3h-2V4l-3-2-3 2-3-2-3 2zm10 12H7v3a1 1 0 11-2 0V5.07l1-.666 3 2 3-2 3 2 3-2 1 .666V16zm1 4H8.83c.11-.313.17-.65.17-1v-1h12v1a1 1 0 01-1 1z" />
  </svg>
);

export default Receipt;
