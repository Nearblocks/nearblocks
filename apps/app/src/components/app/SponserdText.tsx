import { getRequest } from '@/utils/app/api';

import SponserdTextActions from './SponserdTextActions';

const SponserdText = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_USER_API_URL;
  const sponserdText = await getRequest(
    `${apiUrl}approved-campaigns/text-ads`,
    {},
    {},
    false,
  );

  return <SponserdTextActions htmlContent={sponserdText} />;
};

export default SponserdText;
