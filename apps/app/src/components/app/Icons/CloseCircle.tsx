interface Props {
  className?: string;
  onClick?: (name: string) => void;
}
const CloseCircle = (props: Props) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick('All');
    }
  };
  return (
    <svg
      className={props.className}
      height={24}
      onClick={handleClick}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z" />
    </svg>
  );
};

export default CloseCircle;
