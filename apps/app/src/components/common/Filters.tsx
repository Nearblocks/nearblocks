import { capitalize, stripEmpty } from '@/utils/libs';
import CloseCircle from '../Icons/CloseCircle';

interface FiltersProps {
  filters: { [key: string]: any }; // Adjust the type as needed
  onClear?: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  filters = {},
  onClear = () => {},
}) => {
  const stripped = Object.keys(stripEmpty(filters));

  if (!stripped.length) return null;

  return (
    <div className="flex items-center px-2 text-sm mb-4 text-gray-500 lg:ml-auto">
      Filtered By:
      <span className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-1 space-x-2">
        {stripped.map((key) => (
          <span className="flex" key={key}>
            {capitalize(key)}:{' '}
            <span className="inline-block truncate max-w-[120px]">
              <span className="font-semibold">{filters[key]}</span>
            </span>
          </span>
        ))}
        <CloseCircle
          className="w-4 h-4 fill-current cursor-pointer"
          onClick={onClear}
        />
      </span>
    </div>
  );
};

export default Filters;
