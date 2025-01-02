'use client';

import { useEffect, useState } from 'react';

const BannerActions = ({ htmlContent }: any) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function createMarkup(): { __html: string } {
    return { __html: htmlContent };
  }

  if (isMobile) {
    return (
      <div
        className="w-full flex aspect-auto relative"
        suppressHydrationWarning={true}
      >
        <div>
          {htmlContent && <div dangerouslySetInnerHTML={createMarkup()} />}
        </div>{' '}
        <div className="absolute border text-nearblue-600 dark:!text-white dark:border dark:border-nearblue-650/[0.25] bg-white dark:bg-black-200 text-[8px] h-4 p-0.5 inline-flex items-center rounded-md -top-1.5 right-1.5 px-1">
          Ad
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="flex-col lg:mb-0 lg:mt-0 hidden lg:flex mx-auto justify-center py-1"
        suppressHydrationWarning={true}
      >
        {htmlContent && (
          <div className="relative">
            <div dangerouslySetInnerHTML={createMarkup()} />
            <div className="absolute border text-nearblue-600 dark:!text-white dark:border dark:border-nearblue-650/[0.25] bg-white dark:bg-black-200 text-[8px] h-4 p-0.5 inline-flex items-center rounded-md -top-1.5 right-1.5 px-1">
              Ad
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default BannerActions;
