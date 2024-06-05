import passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import {
  Strategy as BearerStrategy,
  VerifyFunction,
} from 'passport-http-bearer';

import { userSql } from '#libs/postgres';

const bearerVerify: VerifyFunction = async (token, done) => {
  const users = await userSql`
    SELECT
      u.*,
      k.id as key_id
    FROM
      api__users u
      LEFT JOIN api__keys k ON k.user_id = u.id
    WHERE
      k.token = ${token}
  `;

  const user = users?.[0];

  if (user) return done(null, user);

  return done(null, false);
};

export const anonymousStrategy = new AnonymousStrategy();
export const bearerStrategy = new BearerStrategy(bearerVerify);

export const bearerAuth = passport.authenticate(['bearer', 'anonymous'], {
  session: false,
});
