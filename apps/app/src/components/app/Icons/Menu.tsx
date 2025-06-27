import React, { SVGProps } from 'react';

const Menu = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      height={24}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Menu;
