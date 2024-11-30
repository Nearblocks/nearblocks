import { getRequest } from '@/utils/app/api';
import { userApiURL } from '@/utils/app/config';

import SponserdTextActions from './SponserdTextActions';

const SponserdText = async () => {
  const sponserdText = await getRequest(
    `${userApiURL}approved-campaigns/text-ads`,
    {},
    {},
    false,
  );

  return <SponserdTextActions htmlContent={sponserdText} />;
};

export default SponserdText;
