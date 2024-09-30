interface Props {
  className?: string;
}

const Plan = (props: Props) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 17.25H3C1.344 17.25 0 15.906 0 14.25V2.4795C0.23475 1.67625 0.96375 0.75 2.25 0.75C3.64125 0.75 4.32675 1.7565 4.49625 2.484L4.5 3.75H18V17.25ZM16.5 5.25H4.5V13.5C4.5 13.5 4.05375 12.75 3.0585 12.75C2.2305 12.75 1.5 13.422 1.5 14.25C1.5 15.078 2.172 15.75 3 15.75H16.5V5.25ZM15 14.25H6V6.75H15V14.25ZM9 7.5H6.75V13.5H14.25V10.5H12.75V12.75H12V10.5H9.75V12.75H9V7.5ZM3 2.74575C2.82525 2.055 1.64475 2.058 1.5 2.74575V11.7435C1.806 11.4277 2.53725 11.2005 3 11.25V2.74575ZM9.75 7.5V9.75H14.25V7.5H9.75Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Plan;
