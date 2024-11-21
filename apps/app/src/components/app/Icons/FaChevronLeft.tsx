interface Props {
  className?: string;
}

const FaChevronLeft = (props: Props) => {
  return (
    <svg
      className={`bi bi-chevron-left ${props.className}`}
      fill="currentColor"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default FaChevronLeft;
