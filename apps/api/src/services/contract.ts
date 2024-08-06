import { Response } from 'express';

import catchAsync from '#libs/async';
import { contractVerificationQueue } from '#libs/bullmq';
import sql from '#libs/postgres';
import { Status, Verify } from '#libs/schema/contract';
import { RequestValidator } from '#types/types';

const verify = catchAsync(
  async (req: RequestValidator<Verify>, res: Response) => {
    const accountId = req.validator.data.accountId;

    const contractZip = req.files?.contractZip;

    // Insert the initial verification status
    const result = await sql`
      INSERT INTO
        contract_verifications (contract, status)
      VALUES
        (${accountId}, 'PENDING')
      RETURNING
        id
    `;
    const verificationId = result[0].id;

    // Add job to BullMQ queue
    await contractVerificationQueue.add(
      'verifyContract',
      {
        accountId,
        contractZip,
        verificationId,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    return res.status(200).json({ verificationId });
  },
);

const status = catchAsync(
  async (req: RequestValidator<Status>, res: Response) => {
    const verificationId = req.validator.data.verificationId;

    const contractVerification = await sql`
      SELECT
        id,
        contract,
        status
      FROM
        contract_verifications
      WHERE
        id = ${verificationId}
      LIMIT
        1
    `;

    return res.status(200).json({ contractVerification });
  },
);

export default { status, verify };
