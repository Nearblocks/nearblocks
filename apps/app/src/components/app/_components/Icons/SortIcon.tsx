import ArrowUp from './ArrowUp';

interface Props {
  order: string;
}
const SortIcon = (props: Props) => {
  return (
    <ArrowUp
      className={`h-3 w-3 fill-current transition-transform mr-1 duration-700 ${
        props.order !== 'asc' ? 'transform rotate-180' : 'transform rotate-0'
      }`}
    />
  );
};

export default SortIcon;
