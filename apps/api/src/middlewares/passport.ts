import passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import {
  Strategy as BearerStrategy,
  VerifyFunction,
} from 'passport-http-bearer';

import config from '#config';
import logger from '#libs/logger';
import { userSql } from '#libs/postgres';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';

const bearerVerify: VerifyFunction = async (token, done) => {
  if (config.apiAccessKey && token === config.apiAccessKey) {
    return done(null, false);
  }

  try {
    const cachedUser = await ratelimiterRedisClient.get(`api_key:${token}`);

    if (cachedUser) {
      return done(null, JSON.parse(cachedUser));
    }

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

    if (user) {
      await ratelimiterRedisClient.set(
        `api_key:${token}`,
        JSON.stringify(user),
        'EX',
        86400,
      );

      return done(null, user);
    }

    return done(null, false);
  } catch (error) {
    logger.error(error);
    return done(null, false);
  }
};

export const anonymousStrategy = new AnonymousStrategy();
export const bearerStrategy = new BearerStrategy(bearerVerify);

export const bearerAuth = passport.authenticate(['bearer', 'anonymous'], {
  session: false,
});
