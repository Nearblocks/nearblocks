"use client"
import React, { useEffect, useState } from 'react';
import { env } from 'next-runtime-env';

const userApiUrl = env('NEXT_PUBLIC_USER_API_URL');
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

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await fetch(
          `${userApiUrl}approved-campaigns/text-ads`,
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
        {htmlContent && (
          <div className="relative">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        )}
      </div>
    );
  }
};

export default SponserdText;
