'use client';

// import { useConfig } from '@/hooks/app/useConfig';
import { useEffect, useMemo, useState } from 'react';

interface BannerData {
  desktopImage: string;
  id?: string;
  mobileImage: string;
  clickUrl: string;
  impressionUrl: string;
}

interface BannerActionsProps {
  bannerInfo: BannerData;
}

const Banner = ({ bannerInfo }: BannerActionsProps) => {
  // const { userAuthURL } = useConfig();
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 425);
      setIsTablet(width > 425 && width <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API Call commented out
  /*
  useEffect(() => {
    if (!bannerInfo) return;
    const impressionUrl = `${userAuthURL}campaigns/track/impression/${bannerInfo?.id}`;
    if (impressionUrl) {
      const img = new Image();
      img.src = impressionUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerInfo]);
  */

  /*
  const createMarkup = useMemo(() => {
    if (!bannerInfo) return { __html: '' };
    return {
      __html: `
        <a href="${userAuthURL}campaigns/track/click/${bannerInfo?.id}" rel="nofollow" target="_blank">
          <picture>
            <img
             src="${
               isMobile
                 ? bannerInfo?.desktopImage
                 : isTablet
                 ? bannerInfo?.mobileImage
                 : bannerInfo?.desktopImage
             }"
              alt="Advertisement"
              class="rounded-lg w-full"
            />
          </picture>
        </a>
      `,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerInfo, isMobile, isTablet]);

  const adLabel = (
    <div className="absolute border text-nearblue-600 dark:!text-white dark:border dark:border-nearblue-650/[0.25] bg-white dark:bg-black-200 text-[8px] h-4 p-0.5 inline-flex items-center rounded-md -top-1.5 right-1.5 px-1">
      Ad
    </div>
  );
  */

  return null;
  
  /* Original return logic commented out
  return bannerInfo ? (
    isMobile ? (
      <div
        className="flex-col lg:mb-0 lg:mt-0 lg:flex mx-auto justify-center py-1"
        suppressHydrationWarning
      >
        <div className="relative">
          <div dangerouslySetInnerHTML={createMarkup} />
          {adLabel}
        </div>
      </div>
    ) : isTablet ? (
      <div
        className="w-full flex aspect-auto relative"
        suppressHydrationWarning
      >
        <div dangerouslySetInnerHTML={createMarkup} />
        {adLabel}
      </div>
    ) : (
      <div
        className="flex-col lg:mb-0 lg:mt-0 hidden lg:flex mx-auto justify-center py-1"
        suppressHydrationWarning
      >
        <div className="relative">
          <div dangerouslySetInnerHTML={createMarkup} />
          {adLabel}
        </div>
      </div>
    )
  ) : null;
  */
};

export default Banner;
