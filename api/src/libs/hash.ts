import crypto from 'node:crypto';

const make = (password: string, salt: Buffer = crypto.randomBytes(32)) => {
  const hashedPassword = crypto.pbkdf2Sync(
    password,
    salt,
    100000,
    64,
    'sha512',
  );

  return {
    salt: salt.toString('hex'),
    hashedPassword: hashedPassword.toString('hex'),
  };
};

const verify = (password: string, salt: string, hashed: string) => {
  const { hashedPassword } = make(password, Buffer.from(salt, 'hex'));

  return crypto.timingSafeEqual(
    Buffer.from(hashedPassword, 'hex'),
    Buffer.from(hashed, 'hex'),
  );
};

export default { make, verify };
