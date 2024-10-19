interface Props {
  className?: string;
}

const Edit = (props: Props) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.21409 9.35727L0 10L0.642727 6.78591L7.42864 0L10 2.57136L3.21409 9.35727ZM2.99 8.93864L1.06136 7.01L0.579545 9.42045L2.99 8.93864ZM7.42864 0.642727L1.38318 6.68864L3.31136 8.61682L9.35727 2.57136L7.42864 0.642727Z"
      fill="currentColor"
    />
  </svg>
);

export default Edit;
