import { getContactDetails } from '@/actions/contact';

import ContactActions from '@/components/app/Contact/ContactActions';

const ContactOptions = async () => {
  return <ContactActions getContactDetails={getContactDetails} />;
};
export default ContactOptions;
