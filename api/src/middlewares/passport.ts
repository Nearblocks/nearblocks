import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';

import { bearerVerify } from '#services/passport';

export const anonymousStrategy = new AnonymousStrategy();
export const bearerStrategy = new BearerStrategy(bearerVerify);

export const bearerAuth = passport.authenticate(['bearer', 'anonymous'], {
  session: false,
});
