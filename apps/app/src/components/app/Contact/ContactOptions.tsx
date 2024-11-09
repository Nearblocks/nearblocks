import { postRequest } from '@/utils/app/api';

import ContactActions from './ContactActions';

const ContactOptions = async () => {
  const getContactDetails = async (contactDeatils: any) => {
    'use server';

    const contactRes = await postRequest('/api/contact', contactDeatils);
    return contactRes;
  };

  return <ContactActions getContactDetails={getContactDetails} />;
};
export default ContactOptions;
