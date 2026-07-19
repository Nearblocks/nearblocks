'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { useErrorBoundary } from 'react-error-boundary';

import { Button } from '@/ui/button';

// Shown when a streamed section fails (rejected data promise). Retry
// re-runs the server render inside a transition so the boundary resets
// against fresh promises (same pattern as Next's error.tsx docs).
export const ErrorFallback = () => {
  const router = useRouter();
  const { resetBoundary } = useErrorBoundary();

  const retry = () =>
    startTransition(() => {
      router.refresh();
      resetBoundary();
    });

  return (
    <div className="text-body-sm text-muted-foreground flex items-center justify-center gap-3 p-6">
      <span>Failed to load this section.</span>
      <Button onClick={retry} size="xs" variant="outline">
        Retry
      </Button>
    </div>
  );
};
