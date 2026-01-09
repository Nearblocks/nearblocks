'use client';

import { useEffect } from 'react';
import { LuServerOff } from 'react-icons/lu';

import { EmptyBox } from '@/components/empty';
import { GlobalLayout } from '@/components/layout/global';
import { Button } from '@/ui/button';
import { EmptyContent } from '@/ui/empty';

import './globals.css';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalError = ({ error, reset }: Props) => {
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
    <GlobalLayout head={<title>Error | NearBlocks</title>}>
      {({ t }) => (
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
      )}
    </GlobalLayout>
  );
};

export default GlobalError;
