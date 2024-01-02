/**
 * @interface Props
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 */

interface Props {
  className?: string;
}

const Skeleton = (props: Props) => {
  return (
    <div
      className={`bg-gray-200 h-4 rounded shadow-sm animate-pulse ${props.className}`}
    ></div>
  );
};

export default Skeleton;
