interface Props {
  className?: string;
}

const EmailCircle = (props: Props) => (
  <svg
    fill="none"
    height="18"
    viewBox="0 0 18 18"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M15 14H3V5H15V14ZM3.5 5.7615V13.5H14.5V5.7615L9.0005 10.7615L3.5 5.7615ZM14.0445 5.5H3.9565L9.0005 10.0855L14.0445 5.5Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <circle cx="9" cy="9" r="8.65" stroke="currentColor" strokeWidth="0.7" />
  </svg>
);

export default EmailCircle;
