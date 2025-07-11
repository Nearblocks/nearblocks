/**
 * @interface Props
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 */

interface Props {
  className?: string;
}
const ArrowRight = (props: Props) => {
  return (
    <svg
      height={20}
      viewBox="0 0 16 16"
      width={20}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default ArrowRight;
