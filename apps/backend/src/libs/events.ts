import { dbEvents } from './pgp.js';

export const upsertError = async (
  contract: string,
  type: string,
  token: null | string,
) => {
  return dbEvents.none(
    `
    INSERT INTO
      errored_contracts (contract, type, token, attempts)
    VALUES
      ($1, $2, $3, 1)
    ON CONFLICT (contract, type, token) DO UPDATE
    SET
      attempts = errored_contracts.attempts + 1
  `,
    [contract, type, token],
  );
};
