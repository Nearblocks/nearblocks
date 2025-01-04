import { Job } from 'bullmq';

import { resetMail, updateMail, verifyMail } from '#libs/mailer';
import { VerificationKind } from '#types/enums';

const emailJob = async (job: Job) => {
  switch (job.name) {
    case VerificationKind.VERIFY_EMAIL:
      return await verifyMail({
        code: job.data.code,
        email: job.data.email,
      });
    case VerificationKind.RESET_PASSWORD:
      return await resetMail({
        code: job.data.code,
        email: job.data.email,
      });
    case VerificationKind.UPDATE_EMAIL:
      return await updateMail({
        code: job.data.code,
        email: job.data.email,
        old_email: job.data.old_email,
      });

    default:
      return;
  }
};

export default emailJob;
