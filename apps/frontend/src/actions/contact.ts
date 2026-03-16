'use server';

import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

import { getServerConfig } from '@/lib/config';
import { contactSchema } from '@/lib/schema/contact';

export type ContactResult = {
  data?: { message: string };
  error?: string;
  statusCode: number;
  success: boolean;
};

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

let sesClient: null | SESClient = null;

const getSESClient = (region: string): SESClient => {
  if (!sesClient) {
    sesClient = new SESClient({ region });
  }

  return sesClient;
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const submitContactForm = async (data: unknown) => {
  const config = getServerConfig();
  const parsed = contactSchema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid request';
    return { error: firstError, statusCode: 400, success: false };
  }

  const { description, email, name, subject, token } = parsed.data;

  const formData = new URLSearchParams();
  formData.append('secret', config.TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(TURNSTILE_VERIFY_URL, {
      body: formData.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      console.error('Turnstile verification request timed out');
    } else {
      console.error('Turnstile verification request failed:', error);
    }
    return {
      error: 'Captcha verification service unavailable',
      statusCode: 502,
      success: false,
    };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!verificationResponse.ok) {
    return {
      error: 'Captcha verification service unavailable',
      statusCode: 502,
      success: false,
    };
  }

  let verifyData: { success: boolean };
  try {
    verifyData = (await verificationResponse.json()) as { success: boolean };
  } catch {
    return {
      error: 'Captcha verification service unavailable',
      statusCode: 502,
      success: false,
    };
  }

  if (!verifyData.success) {
    return {
      error: 'Captcha verification failed',
      statusCode: 400,
      success: false,
    };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeDescription = escapeHtml(description);

  const command = new SendEmailCommand({
    Destination: { ToAddresses: [config.AWS_SES_TO_EMAIL] },
    Message: {
      Body: {
        Html: {
          Data: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <p><strong>Message:</strong></p>
            <p>${safeDescription}</p>
          `,
        },
        Text: {
          Data: `From: ${name} (${email})\nSubject: ${subject}\n\n${description}`,
        },
      },
      Subject: { Data: subject },
    },
    Source: config.AWS_SES_FROM_EMAIL,
  });

  try {
    await getSESClient(config.AWS_REGION).send(command);
    return {
      data: { message: 'Message sent successfully' },
      statusCode: 200,
      success: true,
    };
  } catch (error) {
    console.error('Error sending email via SES:', error);
    return {
      error: 'Failed to send message. Please try again later.',
      statusCode: 502,
      success: false,
    };
  }
};
