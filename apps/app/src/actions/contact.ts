'use server';

import {
  ContactFormData,
  ContactResult,
  submitContact,
} from '@/utils/app/contact';

export async function getContactDetails(
  contactDetails: ContactFormData,
): Promise<ContactResult> {
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
}
