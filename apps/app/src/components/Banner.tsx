import { env } from 'next-runtime-env';
import React, { useEffect, useState } from 'react';
type BannerProps = {
  type: string;
};
const Banner: React.FC<BannerProps> = ({ type }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const userApiUrl = env('NEXT_PUBLIC_USER_API_URL');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await fetch(
          `${userApiUrl}approved-campaigns?type=${type}`,
        );

        if (response?.ok) {
          const html = await response.text();
          setHtmlContent(html);
        }
      } catch (error) {
        console.error('Error fetching HTML content:', error);
      }
    };
    fetchHtmlContent();
  }, [type, userApiUrl]);

  if (isMobile) {
    return (
      <div className="w-full flex aspect-auto relative">
        <div>
          {htmlContent && (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          )}
        </div>{' '}
        <div className="absolute border text-nearblue-600 dark:text-white dark:border dark:border-nearblue-650/[0.25] bg-white dark:bg-black-200 text-[8px] h-4 p-0.5 inline-flex items-center rounded-md -top-1.5 right-1.5 px-1">
          Ad
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex-col lg:mb-0 lg:mt-0 hidden lg:flex mx-auto justify-center py-1">
        {htmlContent && (
          <div className="relative">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <div className="absolute border text-nearblue-600 dark:text-white dark:border dark:border-nearblue-650/[0.25] bg-white dark:bg-black-200 text-[8px] h-4 p-0.5 inline-flex items-center rounded-md -top-1.5 right-1.5 px-1">
              Ad
            </div>
          </div>
        )}
      </div>
    );
  }
};
export default Banner;
