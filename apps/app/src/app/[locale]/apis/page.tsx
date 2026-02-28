import { getContactDetails } from '@/actions/contact';
import ApiActions from '@/components/app/Apis/ApiActions';
import { getRequest } from '@/utils/app/api';
import { userApiURL } from '@/utils/app/config';

export default async function ApisPage(props: {
  searchParams: Promise<{ status: string }>;
}) {
  const searchParams = await props.searchParams;

  const { status } = searchParams;

  const plans = await getRequest(`${userApiURL}plans`, {}, {}, false);
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
