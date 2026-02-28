import ApiActions from '@/components/app/Apis/ApiActions';
import { getRequest } from '@/utils/app/api';
import {
  ContactFormData,
  ContactResult,
  submitContact,
} from '@/utils/app/contact';
import { userApiURL } from '@/utils/app/config';

export default async function ApisPage(props: {
  searchParams: Promise<{ status: string }>;
}) {
  const searchParams = await props.searchParams;

  const { status } = searchParams;

  const plans = await getRequest(`${userApiURL}plans`, {}, {}, false);
  const getContactDetails = async (
    contactDetails: ContactFormData,
  ): Promise<ContactResult> => {
    'use server';

    try {
      return await submitContact(contactDetails);
    } catch (error) {
      console.error('Contact form submission error:', error);
      return {
        error: 'Failed to submit contact form',
        statusCode: 500,
        success: false,
      };
    }
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
