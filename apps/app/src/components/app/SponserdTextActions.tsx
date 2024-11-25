'use client';
import React, { useEffect, useState } from 'react';

type propType = {
  htmlContent: string;
};

const SponserdTextActions = ({ htmlContent }: propType) => {
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
      <div>
        {htmlContent && <div dangerouslySetInnerHTML={createMarkup()} />}
      </div>
    );
  } else {
    return (
      <div>
        {htmlContent ? (
          <div className="relative">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        ) : (
          <div className="h-6 w-1/2" />
        )}
      </div>
    );
  }
};

export default SponserdTextActions;
