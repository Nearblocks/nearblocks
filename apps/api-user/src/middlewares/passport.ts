import passport from 'passport';
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
} from 'passport-jwt';

import config from '#config';
import { jwtVerify } from '#services/passport';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
passport.use('jwt', jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

export { jwtAuth, jwtStrategy };
