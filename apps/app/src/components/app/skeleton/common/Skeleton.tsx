interface Props {
  className?: string;
}

export const Loader = (props: {
  className?: string;
  wrapperClassName?: string;
}) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props?.wrapperClassName}`}
    ></div>
  );
};

const Skeleton = (props: Props) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-black-200  rounded shadow-sm animate-pulse ${props.className}`}
    ></div>
  );
};

export default Skeleton;
