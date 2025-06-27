interface Props {
  className?: string;
}
const UnlockCircle = (props: Props) => (
  <svg
    fill="none"
    height="18"
    viewBox="0 0 18 18"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="9" cy="9" r="8.65" stroke="currentColor" strokeWidth="0.7" />
    <path
      clipRule="evenodd"
      d="M8.58333 8.16667V6.5C8.58333 5.35 7.65 4.41667 6.5 4.41667C5.35 4.41667 4.41667 5.35 4.41667 6.5V7.33333H4V6.5C4 5.12 5.12042 4 6.5 4C7.87958 4 9 5.12042 9 6.5V8.16667H13.1667V14H5.66667V8.16667H8.58333ZM12.75 8.58333H6.08333V13.5833H12.75V8.58333Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export default UnlockCircle;
