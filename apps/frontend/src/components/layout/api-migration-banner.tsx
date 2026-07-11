'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'api-migration-banner-dismissed';
const MIGRATION_URL = 'https://api.nearblocks.io/api-docs/migration';

// remove when v1/v2 sunsetted
export const ApiMigrationBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="bg-primary text-primary-foreground flex items-center gap-3 px-4 py-2">
      <p className="text-body-sm flex-1 text-center">
        The NearBlocks API v3 is now live. v1 and v2 are deprecated —{' '}
        <a
          className="font-medium underline underline-offset-2"
          href={MIGRATION_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          read the migration guide
        </a>
        .
      </p>
      <button
        aria-label="Dismiss"
        className="hover:bg-primary-foreground/10 shrink-0 rounded-md p-1"
        onClick={dismiss}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
