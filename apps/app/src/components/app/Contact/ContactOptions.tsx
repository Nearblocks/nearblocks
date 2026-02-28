import {
  ContactFormData,
  ContactResult,
  submitContact,
} from '@/utils/app/contact';

import ContactActions from '@/components/app/Contact/ContactActions';

const ContactOptions = async () => {
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

  return <ContactActions getContactDetails={getContactDetails} />;
};
export default ContactOptions;
