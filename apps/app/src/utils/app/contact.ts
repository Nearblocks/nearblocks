import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile';

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

const TO_EMAIL = process.env.AWS_SES_TO_EMAIL;
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface ContactFormData {
  description: string;
  email: string;
  name: string;
  subject: string;
  token: string;
}

export interface ContactResult {
  data?: any;
  error?: string;
  success: boolean;
}

export async function submitContact(
  body: ContactFormData,
): Promise<ContactResult> {
  const { description, email, name, subject, token } = body;

  if (!name || !email || !subject || !description) {
    return { error: 'Missing required fields', success: false };
  }

  if (!TO_EMAIL || !FROM_EMAIL || !TURNSTILE_SECRET_KEY) {
    return { error: 'Server configuration error', success: false };
  }

  if (!token) {
    return { error: 'Captcha token is missing', success: false };
  }

  const formData = new URLSearchParams();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const verificationResponse = await fetch(TURNSTILE_VERIFY_URL, {
    body: formData.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!verificationResponse.ok) {
    console.error(
      'Turnstile verification request failed:',
      verificationResponse.status,
    );
    return { error: 'Captcha verification service unavailable', success: false };
  }

  const data =
    (await verificationResponse.json()) as TurnstileServerValidationResponse;

  if (!data.success) {
    console.log('Captcha verification failed:', data);
    return { error: 'Captcha verification failed', success: false };
  }

  const params = {
    Destination: {
      ToAddresses: [TO_EMAIL],
    },
    Message: {
      Body: {
        Html: {
          Data: `
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p>${description}</p>
            `,
        },
        Text: {
          Data: `From: ${name} (${email})\nSubject: ${subject}\n\n${description}`,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: FROM_EMAIL,
  };

  const command = new SendEmailCommand(params);
  const emailResponse = await sesClient.send(command);
  console.log('Email sent successfully:', emailResponse);

  return {
    data: { message: 'Message sent successfully' },
    success: true,
  };
}
