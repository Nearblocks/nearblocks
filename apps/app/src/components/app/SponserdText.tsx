'use client';
import React, { useEffect, useState } from 'react';
import Skeleton from './skeleton/common/Skeleton';

const userApiUrl = process.env.NEXT_PUBLIC_USER_API_URL;
const SponserdText: React.FC<any> = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use a promise-based approach to fetch HTML content
  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await fetch(
          `${userApiUrl}approved-campaigns/text-ads`,
        );

        if (response.ok) {
          const html = await response.text();
          setHtmlContent(html);
        } else {
          console.error('Error fetching HTML content:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching HTML content:', error);
      }
    };

    fetchHtmlContent();
  }, []);

  if (isMobile) {
    return (
      <div>
        {htmlContent && (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        )}
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
          <Skeleton className="h-6 w-1/2" />
        )}
      </div>
    );
  }
};

export default SponserdText;
