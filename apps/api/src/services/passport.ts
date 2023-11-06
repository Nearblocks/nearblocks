import { VerifyFunction } from 'passport-http-bearer';

import { mainnetDb } from '#libs/db';
import { keyBinder } from '#libs/utils';

export const bearerVerify: VerifyFunction = async (token, done) => {
  const { query, values } = keyBinder(
    `
      SELECT
        u.*
      FROM
        api__users u
        LEFT JOIN api__keys k ON k.user_id = u.id
      WHERE
        k.token = :token
    `,
    { token },
  );

  const { rows } = await mainnetDb.query(query, values);
  const user = rows?.[0];

  if (user) {
    return done(null, user);
  }

  return done(null, false);
};
