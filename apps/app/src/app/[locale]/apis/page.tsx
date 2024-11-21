export const runtime = 'edge';

import ApiActions from '@/components/app/Apis/ApiActions';
import { getRequest, postRequest } from '@/utils/app/api';

const userApiURL = process.env.NEXT_PUBLIC_USER_API_URL;
export default async function ApisPage(props: {
  searchParams: Promise<{ status: string }>;
}) {
  const searchParams = await props.searchParams;

  const { status } = searchParams;

  const plans = await getRequest(`${userApiURL}plans`, {}, {}, false);
  const getContactDetails = async (contactDeatils: any) => {
    'use server';

    const contactRes = await postRequest('/api/contact', contactDeatils);
    return contactRes;
  };
  return (
    <section>
      <ApiActions
        getContactDetails={getContactDetails}
        planDetails={plans}
        status={status}
      />
    </section>
  );
}
