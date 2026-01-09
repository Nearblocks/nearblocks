import { useLocale } from '@/hooks/use-locale';
import { NativeSelect, NativeSelectOption } from '@/ui/native-select';

type Props = {
  filter: string;
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SearchFilter = ({ filter, onSelect }: Props) => {
  const { t } = useLocale('layout');

  return (
    <NativeSelect
      className="text-white-950 h-9 w-34 rounded-lg border-0 bg-transparent! px-4 shadow-none"
      onChange={onSelect}
      value={filter}
    >
      <NativeSelectOption value="">{t('search.filters')}</NativeSelectOption>
      <NativeSelectOption value="txns">{t('search.txns')}</NativeSelectOption>
      <NativeSelectOption value="blocks">
        {t('search.blocks')}
      </NativeSelectOption>
      <NativeSelectOption value="addresses">
        {t('search.addresses')}
      </NativeSelectOption>
      <NativeSelectOption value="tokens">
        {t('search.tokens')}
      </NativeSelectOption>
    </NativeSelect>
  );
};
