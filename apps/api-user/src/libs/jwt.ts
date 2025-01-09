import jwt from 'jsonwebtoken';

import config from '#config';
import dayjs from '#libs/dayjs';
import { User } from '#types/types';

const sign = (user: User, remember = false) => {
  const exp = dayjs
    .utc()
    .add(1, remember ? 'week' : 'hour')
    .unix();

  const role =
    user.username === config.adminUsername ? 'publisher' : 'advertiser';

  return jwt.sign(
    {
      exp,
      role: role,
      sub: user.id,
      username: user.username,
    },
    config.jwtSecret,
  );
};

const verify = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};

export default { sign, verify };
