import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile';

const TO_EMAIL = process.env.AWS_SES_TO_EMAIL;
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const verifyEndpoint =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

export default async function handler(req: any, res: any) {
  const { method } = req;

  if (method === 'POST') {
    try {
      const { body } = req;
      const { name, email, subject, description, token } = body;

      // Validate that the Turnstile token is present
      if (!token) {
        return res
          .status(400)
          .json({ status: 0, err: 'Captcha token is missing' });
      }

      // Turnstile verification
      const verificationResponse = await fetch(verifyEndpoint, {
        method: 'POST',
        body: `secret=${encodeURIComponent(
          TURNSTILE_SECRET_KEY as string,
        )}&response=${encodeURIComponent(token)}`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      });

      const data =
        (await verificationResponse.json()) as TurnstileServerValidationResponse;

      // Check if Turnstile verification was successful
      if (!data.success) {
        return res.status(400).json({
          status: 0,
          err: 'Captcha verification failed',
          details: data,
        });
      }

      if (!TO_EMAIL || !FROM_EMAIL) {
        return res
          .status(500)
          .json({ status: 0, err: 'Sender or recipient email not defined' });
      }

      // Set up the email parameters
      const params = {
        Source: FROM_EMAIL, // Verified sender email
        Destination: {
          ToAddresses: [TO_EMAIL], // Recipient's email
        },
        Message: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: `<p><strong>From:</strong> ${name} (${email})</p><p>${description}</p>`,
            },
            Text: {
              Data: `From: ${name} (${email})\n\n${description}`, // Plaintext fallback
            },
          },
        },
      };

      // Send the email using AWS SES
      const command = new SendEmailCommand(params);
      const emailResponse = await sesClient.send(command);

      return res.status(200).json({ status: 1, data: emailResponse });
    } catch (err: any) {
      return res.status(500).json({ status: 0, err: err.message });
    }
  } else {
    return res.status(405).json({ status: 0, err: 'Method Not Allowed' });
  }
}
