'use client';
import { useConfig } from '@/hooks/app/useConfig';
import React, { useEffect, useMemo, useState } from 'react';

interface TextAdData {
  icon: string;
  id: string;
  linkName: string;
  siteName: string;
  text: string;
  clickUrl: string;
  impressionUrl: string;
}

interface PropType {
  textAdInfo: TextAdData;
}

const SponseredTextActions = ({ textAdInfo }: PropType) => {
  const [isMobile, setIsMobile] = useState(false);
  const { userAuthURL } = useConfig();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!textAdInfo) return;
    const impressionUrl = `${userAuthURL}campaigns/track/impression/${textAdInfo.id}`;
    if (impressionUrl) {
      const img = new Image();
      img.src = impressionUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textAdInfo]);

  const createMarkup = useMemo(() => {
    if (!textAdInfo) return { __html: '' };

    const htmlContent = `
      <div class="ad-text-content" style="font-size: 14px; font-family: Manrope, sans-serif; text-align: left;">
        <p><b>Sponsored: </b>
          <img src="${textAdInfo.icon}" alt="Icon" class="ad-icon" style="display: inline;">
          &nbsp;<b>${textAdInfo.siteName}</b>: ${textAdInfo.text}
          <a href="${userAuthURL}campaigns/track/click/${textAdInfo.id}" class="text-blue-500 dark:text-green-250 font-bold no-underline" target="_blank" rel="nofollow">${textAdInfo.linkName}</a>
        </p>
      </div>
    `;

    return { __html: htmlContent };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textAdInfo]);

  return (
    <div>
      {isMobile ? (
        <div dangerouslySetInnerHTML={createMarkup} />
      ) : (
        <div className="relative">
          {textAdInfo ? (
            <div dangerouslySetInnerHTML={createMarkup} />
          ) : (
            <div className="h-6 w-1/2" />
          )}
        </div>
      )}
    </div>
  );
};

export default SponseredTextActions;
