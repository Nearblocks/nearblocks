import { NativeSelect, NativeSelectOption } from '@/ui/native-select';

type Props = {
  filter: string;
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SearchFilter = ({ filter, onSelect }: Props) => {
  return (
    <NativeSelect
      className="text-white-950 h-9 w-34 rounded-lg border-0 bg-transparent! px-4 shadow-none"
      onChange={onSelect}
      value={filter}
    >
      <NativeSelectOption value="">All Filters</NativeSelectOption>
      <NativeSelectOption value="txns">Txns</NativeSelectOption>
      <NativeSelectOption value="blocks">Blocks</NativeSelectOption>
      <NativeSelectOption value="addresses">Addresses</NativeSelectOption>
      <NativeSelectOption value="tokens">Tokens</NativeSelectOption>
    </NativeSelect>
  );
};
