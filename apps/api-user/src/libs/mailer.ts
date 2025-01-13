import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

import config from '#config';
import reset from '#libs/templates/reset';
import updateEmail from '#libs/templates/updateEmail';
import verify from '#libs/templates/verify';

export type VerifyData = {
  code: string;
  email: string;
  subject?: string;
};

export type UpdateEmailData = {
  code: string;
  email: string;
  old_email: string;
  subject?: string;
};

const sesClient = new SESClient({
  credentials: {
    accessKeyId: config.sesAccessKey,
    secretAccessKey: config.sesSecretKey,
  },
  region: config.sesRegion,
});

const sendMail = async (to: string, subject: string, html: string) => {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: {
        Html: { Data: html },
      },
      Subject: { Data: subject },
    },
    Source: config.sesEmailFrom,
  };

  const command = new SendEmailCommand(params);
  return sesClient.send(command);
};

export const verifyMail = async (data: VerifyData) => {
  const subject = 'Please confirm your email [NearBlocks.io]';
  data.subject = subject;

  const html = verify(data);

  return sendMail(data.email, subject, html);
};

export const resetMail = async (data: VerifyData) => {
  const subject = 'Lost Password recovery [NearBlocks.io]';
  data.subject = subject;

  const html = reset(data);

  return sendMail(data.email, subject, html);
};

export const updateMail = async (data: UpdateEmailData) => {
  const subject = 'Please confirm your email [NearBlocks.io]';
  data.subject = subject;

  const html = updateEmail(data);

  return sendMail(data.email, subject, html);
};

export default sesClient;
