import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const TO_EMAIL = process.env.AWS_SES_TO_EMAIL;
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;

// Initialize the AWS SES Client
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

export default async function handler(req: any, res: any) {
  const { method } = req;

  if (method === 'POST') {
    try {
      const { body } = req;
      const { name, email, subject, description } = body;

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
      const data = await sesClient.send(command);

      return res.status(200).json({ status: 1, data });
    } catch (err: any) {
      return res.status(500).json({ status: 0, err: err.message });
    }
  }
}
