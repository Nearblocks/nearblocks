interface Props {
  className?: string;
}

const LockCircle = (props: Props) => (
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
      d="M6.33333 5.75C6.33333 4.23246 7.52844 3 9 3C10.4716 3 11.6667 4.232 11.6667 5.75V7.58333H13V14H5V7.58333H6.33333V5.75ZM12.5556 8.04167H5.44444V13.5417H12.5556V8.04167ZM6.77778 5.75V7.58333H11.2222V5.75C11.2222 4.485 10.2267 3.45833 9 3.45833C7.77333 3.45833 6.77778 4.485 6.77778 5.75Z"
      fill="currentColor"
    />
    <circle cx="9" cy="9" r="8.65" stroke="currentColor" strokeWidth="0.7" />
  </svg>
);

export default LockCircle;
