export const runtime = 'edge';

import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile';
import { NextRequest, NextResponse } from 'next/server';

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

const TO_EMAIL = process.env.AWS_SES_TO_EMAIL;
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface ContactFormData {
  description: string;
  email: string;
  name: string;
  subject: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactFormData;

    const { description, email, name, subject, token } = body;

    if (!name || !email || !subject || !description) {
      return NextResponse.json(
        { err: 'Missing required fields', status: 0 },
        { status: 400 },
      );
    }

    if (!TO_EMAIL || !FROM_EMAIL || !TURNSTILE_SECRET_KEY) {
      return NextResponse.json(
        { err: 'Server configuration error', status: 0 },
        { status: 500 },
      );
    }

    if (!token) {
      return NextResponse.json(
        { err: 'Captcha token is missing', status: 0 },
        { status: 400 },
      );
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
      return NextResponse.json(
        { err: 'Captcha verification service unavailable', status: 0 },
        { status: 502 },
      );
    }

    const data =
      (await verificationResponse.json()) as TurnstileServerValidationResponse;

    if (!data.success) {
      console.log('Captcha verification failed:', data);
      return NextResponse.json(
        { details: data, err: 'Captcha verification failed', status: 0 },
        { status: 400 },
      );
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

    return NextResponse.json(
      { message: 'Message sent successfully', status: 1 },
      { status: 200 },
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      {
        detail:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
        err: 'An unexpected error occurred',
        status: 0,
      },
      { status: 500 },
    );
  }
}
