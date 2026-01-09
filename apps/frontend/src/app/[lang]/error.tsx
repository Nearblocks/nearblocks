'use client';

import { useEffect } from 'react';
import { LuServerOff } from 'react-icons/lu';

import { EmptyBox } from '@/components/empty';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import { EmptyContent } from '@/ui/empty';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error = ({ error, reset }: Props) => {
  const { t } = useLocale('layout');

  useEffect(() => {
    console.error(error);
  }, [error]);

  const onReset = () => {
    try {
      reset();
    } catch {
      //
    }
  };

  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="bg-card container mx-auto flex flex-1 items-center justify-center rounded-lg">
        <EmptyBox
          description={t('errors.serverError.description')}
          icon={<LuServerOff />}
          title={t('errors.serverError.title')}
        >
          <EmptyContent>
            <Button asChild variant="secondary">
              <a href="/" onClick={onReset}>
                {t('errors.footer.button')}
              </a>
            </Button>
          </EmptyContent>
        </EmptyBox>
      </div>
    </main>
  );
};

export default Error;
