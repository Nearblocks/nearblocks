import { getRequest } from '@/utils/app/api';
import { apiUrl } from '@/utils/app/config';

import BannerActions from './BannerActions';

type BannerProps = {
  type: string;
};
apiUrl;
const Banner = async ({ type }: BannerProps) => {
  const apiUrl = process.env.NEXT_PUBLIC_USER_API_URL;
  const bannerData = await getRequest(
    `${apiUrl}approved-campaigns?type=${type}`,
    {},
    {},
    false,
  );

  return <BannerActions htmlContent={bannerData} />;
};

export default Banner;
