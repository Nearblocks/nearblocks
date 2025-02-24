import { VerifyCallback } from 'passport-jwt';

import db from '#libs/db';
import { keyBinder } from '#libs/utils';

export const jwtVerify: VerifyCallback = async (payload, done) => {
  const { query, values } = keyBinder(
    `
      SELECT
        *
      FROM
        api__users
      WHERE
        id = :id
    `,
    { id: payload.sub },
  );

  const { rows } = await db.query(query, values);
  const user = rows?.[0];

  if (user) {
    return done(null, user);
  }

  return done(null, false);
};
