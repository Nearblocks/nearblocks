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
  return <SponserdTextActions textAdInfo={sponserdText} />;
}
