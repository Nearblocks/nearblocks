import { getRequest } from '@/utils/app/api';
import { userApiURL } from '@/utils/app/config';

import BannerActions from './BannerActions';

type BannerProps = {
  type: string;
};
const Banner = async ({ type }: BannerProps) => {
  const bannerData = await getRequest(
    `${userApiURL}approved-campaigns?type=${type}`,
    {},
    {},
    false,
  );

  return <BannerActions htmlContent={bannerData} />;
};

export default Banner;
