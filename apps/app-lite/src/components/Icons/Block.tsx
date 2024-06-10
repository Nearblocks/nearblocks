import { SVGProps } from 'react';

const Block = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zM5.494 7.078L12 10.844l6.506-3.766L12 3.31 5.494 7.078zM4.5 8.813v7.534L11 20.11v-7.534L4.5 8.813zM13 20.11l6.5-3.763V8.813L13 12.576v7.534z" />
  </svg>
);

export default Block;
