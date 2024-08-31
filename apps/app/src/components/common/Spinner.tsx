import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface SpinnerProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const Spinner = ({ loading, setLoading }: SpinnerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSpinner(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setShowSpinner(false);
      return () => {};
    }
  }, [loading]);

  const handleClose = () => {
    setLoading(false);

    const timeout = setTimeout(() => {
      router.replace(router.asPath, undefined, { shallow: true });
    }, 100);

    return () => clearTimeout(timeout);
  };

  if (!isClient || !showSpinner) return null;

  return (
    <div
      className="fixed inset-0 z-[500] bg-black bg-opacity-10 dark:bg-opacity-50"
      onClick={handleClose}
    >
      <div className="fixed top-4 right-4 z-[600] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-solid border-black dark:border-neargray-10 border-b-transparent dark:border-b-current rounded-full animate-spin duration-1000 linear infinite"></div>
      </div>
    </div>
  );
};
