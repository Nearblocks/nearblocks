import { BannerAdData } from '@/utils/types';
import React from 'react';
import BannerActions from '@/components/app/BannerActions';

const Banner = ({ bannerInfo }: { bannerInfo: BannerAdData }) => {
  if (bannerInfo && Object.keys(bannerInfo).length > 0) {
    return <BannerActions bannerInfo={bannerInfo} />;
  }
  return null;
};

export default Banner;
