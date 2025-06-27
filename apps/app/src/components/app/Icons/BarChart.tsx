interface Props {
  className: string;
}

const Near = (props: Props) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 27 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {' '}
      <path
        d="M0 7h2v9H0zM5 5h2v11H5zM10 0h2v16h-2zM15 5h2v11h-2zM20 0h2v16h-2zM25 0h2v16h-2z"
        fill="currentColor"
      ></path>{' '}
    </svg>
  );
};

export default Near;
