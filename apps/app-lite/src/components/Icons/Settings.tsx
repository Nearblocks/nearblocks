import { SVGProps } from 'react';

const Settings = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M2 18h7v2H2v-2zm0-7h9v2H2v-2zm0-7h20v2H2V4zm18.674 9.025l1.156-.391 1 1.732-.916.805a4.014 4.014 0 010 1.658l.916.805-1 1.732-1.156-.391c-.41.37-.898.654-1.435.83L19 21h-2l-.24-1.196a3.997 3.997 0 01-1.434-.83l-1.156.392-1-1.732.916-.805a4.014 4.014 0 010-1.658l-.916-.805 1-1.732 1.156.391c.41-.37.898-.655 1.435-.83L17 11h2l.24 1.196c.536.175 1.024.46 1.434.83zM18 18a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

export default Settings;
