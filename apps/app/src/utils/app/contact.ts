import 'server-only';

import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile';

const TO_EMAIL = process.env.AWS_SES_TO_EMAIL;
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_REGION,
    });
  }
  return sesClient;
}

export interface ContactFormData {
  description: string;
  email: string;
  name: string;
  subject: string;
  token: string;
}

export interface ContactResultData {
  message: string;
}

export interface ContactResult {
  data?: ContactResultData;
  error?: string;
  statusCode: number;
  success: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function submitContact(
  body: ContactFormData,
): Promise<ContactResult> {
  const { description, email, name, subject, token } = body;

  if (!name || !email || !subject || !description) {
    return {
      error: 'Missing required fields',
      statusCode: 400,
      success: false,
    };
  }

  if (
    !TO_EMAIL ||
    !FROM_EMAIL ||
    !TURNSTILE_SECRET_KEY ||
    !process.env.AWS_REGION
  ) {
    return {
      error: 'Server configuration error',
      statusCode: 500,
      success: false,
    };
  }

  if (!token) {
    return {
      error: 'Captcha token is missing',
      statusCode: 400,
      success: false,
    };
  }

  const formData = new URLSearchParams();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const turnstileTimeoutMs = 10_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, turnstileTimeoutMs);

  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(TURNSTILE_VERIFY_URL, {
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as any)?.name === 'AbortError') {
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
    console.error(
      'Turnstile verification request failed:',
      verificationResponse.status,
    );
    return {
      error: 'Captcha verification service unavailable',
      statusCode: 502,
      success: false,
    };
  }

  let data: TurnstileServerValidationResponse;
  try {
    data =
      (await verificationResponse.json()) as TurnstileServerValidationResponse;
  } catch (error) {
    console.error('Failed to parse Turnstile verification response:', error);
    return {
      error: 'Captcha verification service unavailable',
      statusCode: 502,
      success: false,
    };
  }

  if (!data.success) {
    console.error('Captcha verification failed:', data);
    return {
      error: 'Captcha verification failed',
      statusCode: 400,
      success: false,
    };
  }

  const client = getSESClient();

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeDescription = escapeHtml(description);

  const params = {
    Destination: {
      ToAddresses: [TO_EMAIL],
    },
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
      Subject: {
        Data: subject,
      },
    },
    Source: FROM_EMAIL,
  };

  const command = new SendEmailCommand(params);

  try {
    const emailResponse = await client.send(command);
    console.log('Email sent successfully:', emailResponse);

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
}
