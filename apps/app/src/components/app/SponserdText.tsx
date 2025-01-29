import { userAuthURL } from '@/utils/app/config';
import SponserdTextActions from './SponserdTextActions';
import { getRequest } from '@/utils/app/api';
export default async function SponserdText() {
  const sponserdText = await getRequest(
    `${userAuthURL}campaigns/text-ads`,
    {},
    {},
    false,
  );
  if (sponserdText && Object.keys(sponserdText).length > 0) {
    return <SponserdTextActions textAdInfo={sponserdText} />;
  }
  return null;
}
