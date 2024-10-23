interface Props {
  className?: string;
}
const LoginCircle = (props: Props) => (
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
      d="M9.45455 3.90909V3L14 4.36364V12.5455L9.45455 13.9091V13H5.36364V9.81818H5.81818V12.5455H9.45455V4.36364H5.81818V7.54545H5.36364V3.90909H9.45455ZM9.90909 13.2982L13.5455 12.2073V4.70182L9.90909 3.61091V13.2982ZM8.115 8.45455L6.61818 6.95773L6.93955 6.63636L8.985 8.68182L6.93955 10.7273L6.61818 10.4059L8.115 8.90909H4V8.45455H8.115Z"
      fill="currentColor"
    />
    <circle cx="9" cy="9" r="8.65" stroke="currentColor" strokeWidth="0.7" />
  </svg>
);

export default LoginCircle;
