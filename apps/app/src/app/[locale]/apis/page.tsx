import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getRequest, postRequest } from '@/utils/app/api';
import ApiActions from '@/components/app/Apis/ApiActions';

const userApiURL = process.env.NEXT_PUBLIC_USER_API_URL;
export default async function ApisPage({
  searchParams: { status },
}: {
  searchParams: { status: string };
}) {
  const plans = await getRequest(`${userApiURL}/plans`, {}, {}, false);

  const getContactDetails = async (contactDeatils: any) => {
    'use server';

    const contactRes = await postRequest('/api/contact', contactDeatils);
    return contactRes;
  };
  return (
    <section>
      <ToastContainer />
      <ApiActions
        status={status}
        planDetails={plans}
        getContactDetails={getContactDetails}
      />
    </section>
  );
}
