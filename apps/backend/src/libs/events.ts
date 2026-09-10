import { logger } from 'nb-logger';

import { dbEvents } from '#libs/knex';

export const upsertError = async (
  contract: string,
  type: string,
  token: null | string,
  permanent = false,
) => {
  try {
    await dbEvents.raw(
      `
      INSERT INTO
        errored_contracts (contract, type, token, attempts)
      VALUES
        (?, ?, ?, ?)
      ON CONFLICT (contract, type, token) DO UPDATE
      SET
        attempts = CASE
          WHEN ? THEN ?
          ELSE errored_contracts.attempts + 1
        END
    `,
      [contract, type, token, permanent ? 3 : 1, permanent, 3],
    );
  } catch (error) {
    logger.error(error);
  }
};
