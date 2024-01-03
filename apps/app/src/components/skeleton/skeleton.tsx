interface Props {
  className?: string;
}
const Skeleton = (props: Props) => {
  return (
    <div
      className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className}`}
    ></div>
  );
};
export default Skeleton;
