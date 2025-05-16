import { useEffect } from 'react';
import { useState } from 'react';
import { Ad, IAd } from '@/components/app/Ad';
import React from 'react';

interface IDynamicAd extends Omit<IAd, 'unitId' | 'format'> {
  breakpoint: number;
  desktopUnitId: string;
  mobileUnitId: string;
}

const DynamicAd = ({
  breakpoint,
  desktopUnitId,
  mobileUnitId,
  ...props
}: IDynamicAd) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile ? (
    <Ad
      {...props}
      unitId={mobileUnitId}
      format="Small Rectangle"
      key={mobileUnitId}
    />
  ) : (
    <Ad
      {...props}
      unitId={desktopUnitId}
      format="Leaderboard"
      key={desktopUnitId}
    />
  );
};

export default DynamicAd;
