import { capitalize, stripEmpty } from '@/utils/libs';
import CloseCircle from '@/components/app/Icons/CloseCircle';
interface FiltersProps {
  filters: { [key: string]: any };
  onClear?: () => void;
}
const Filters: React.FC<FiltersProps> = ({
  filters = {},
  onClear = () => {},
}) => {
  const stripped = Object.keys(stripEmpty(filters));
  if (!stripped?.length) return null;
  return (
    <div className="flex flex-wrap sm:!flex-nowrap items-center text-sm text-gray-500 dark:text-neargray-10 lg:ml-auto">
      <span className="whitespace-nowrap mb-2 sm:!mb-0">Filtered By:</span>
      <div className="flex flex-wrap sm:!flex-nowrap items-center bg-gray-100 dark:bg-black-200 rounded-lg px-3 py-1 ml-1 space-x-2">
        {stripped &&
          stripped.map((key) => (
            <span className="flex items-center space-x-1" key={key}>
              <span>{capitalize(key)}: </span>
              <span className="font-semibold sm:!max-w-[100px] max-w-[80px] truncate">
                <span>{filters[key]}</span>
              </span>
            </span>
          ))}
        <CloseCircle
          className="w-4 h-4 fill-current cursor-pointer"
          onClick={onClear}
        />
      </div>
    </div>
  );
};
export default Filters;
