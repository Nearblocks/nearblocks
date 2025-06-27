interface Props {
  className?: string;
}

const FaChevronRight = (props: Props) => {
  return (
    <svg
      className={`bi bi-chevron-right ${props.className}`}
      fill="currentColor"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default FaChevronRight;
