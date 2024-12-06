import ApiActions from '@/components/app/Apis/ApiActions';
import { getRequest, postRequest } from '@/utils/app/api';
import { userApiURL } from '@/utils/app/config';

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
