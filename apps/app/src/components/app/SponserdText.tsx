'use client';
import { useEnvContext } from 'next-runtime-env';
import React, { useEffect, useState } from 'react';

const SponserdText = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const { NEXT_PUBLIC_API_URL: apiUrl } = useEnvContext();

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
        const response = await fetch(`${apiUrl}campaigns/text-ads`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

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
          <div className="h-6 w-1/2" />
        )}
      </div>
    );
  }
};

export default SponserdText;
