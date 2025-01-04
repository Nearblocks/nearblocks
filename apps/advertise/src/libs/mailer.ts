import nodemailer from 'nodemailer';

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

const mailer = nodemailer.createTransport({
  auth: {
    pass: config.smtpPass,
    user: config.smtpUser,
  },
  host: config.smtpHost,
  port: config.smtpPort,
});

export const verifyMail = async (data: VerifyData) => {
  const subject = 'Please confirm your email [NearBlocks.io]';
  data.subject = subject;
  const message = {
    from: config.smtpMail,
    html: verify(data),
    subject,
    to: data.email,
  };

  return mailer.sendMail(message);
};

export const resetMail = async (data: VerifyData) => {
  const subject = 'Lost Password recovery [NearBlocks.io]';
  data.subject = subject;
  const message = {
    from: config.smtpMail,
    html: reset(data),
    subject,
    to: data.email,
  };

  return mailer.sendMail(message);
};

export const updateMail = async (data: UpdateEmailData) => {
  const subject = 'Please confirm your email [NearBlocks.io]';
  data.subject = subject;
  const message = {
    from: config.smtpMail,
    html: updateEmail(data),
    subject,
    to: data.email,
  };

  return mailer.sendMail(message);
};

export default mailer;
