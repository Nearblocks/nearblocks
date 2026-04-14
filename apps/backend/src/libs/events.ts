import { logger } from 'nb-logger';

import { dbEvents } from '#libs/knex';

export const upsertError = async (
  contract: string,
  type: string,
  token: null | string,
) => {
  try {
    await dbEvents.raw(
      `
      INSERT INTO
        errored_contracts (contract, type, token, attempts)
      VALUES
        (?, ?, ?, 1)
      ON CONFLICT (contract, type, token) DO UPDATE
      SET
        attempts = errored_contracts.attempts + 1
    `,
      [contract, type, token],
    );
  } catch (error) {
    logger.error(error);
  }
};
