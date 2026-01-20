import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { NativeSelect, NativeSelectOption } from '@/ui/native-select';

type Props = {
  className?: string;
  filter: string;
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SearchFilter = ({ className, filter, onSelect }: Props) => {
  const { t } = useLocale('layout');

  return (
    <NativeSelect
      className={cn(
        'text-card-foreground rounded-lg border-0 bg-transparent! px-4 py-0 shadow-none',
        className,
      )}
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
