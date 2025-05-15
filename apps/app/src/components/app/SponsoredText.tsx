import SponsoredTextActions from '@/components/app/SponsoredTextActions';
import { TextAdData } from '@/utils/types';

export default function SponsoredText({
  sponsoredText,
}: {
  sponsoredText: TextAdData;
}) {
  return sponsoredText && Object.keys(sponsoredText).length > 0 ? (
    <SponsoredTextActions textAdInfo={sponsoredText} />
  ) : null;
}
