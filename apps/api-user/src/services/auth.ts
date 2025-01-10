import crypto from 'node:crypto';

import { Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import hash from '#libs/hash';
import jwt from '#libs/jwt';
import { emailQueue } from '#libs/queue';
import {
  Forgot,
  Login,
  Register,
  Resend,
  Reset,
  Verify,
} from '#libs/schema/auth';
import { keyBinder, validationErrors } from '#libs/utils';
import { VerificationKind } from '#types/enums';
import { RequestValidator } from '#types/types';

const login = catchAsync(
  async (req: RequestValidator<Login>, res: Response) => {
    const username_or_email = req.validator.data.username_or_email;
    const password = req.validator.data.password;
    const remember = req.validator.data.remember;
    const date = dayjs.utc().toISOString();

    const userQuery = keyBinder(
      `
        SELECT
          *
        FROM
          api__users
        WHERE
          username = :username_or_email OR email = :username_or_email
      `,
      { username_or_email },
    );

    const { rows } = await db.query(userQuery.query, userQuery.values);
    const user = rows?.[0];

    if (!user)
      return res.status(422).json(
        validationErrors([
          { message: 'Invalid username or email', path: 'username_or_email' },
          { message: 'Invalid username or password', path: 'password' },
        ]),
      );

    let isPasswordValid = false;

    if (user.password.startsWith('$2y$')) {
      return res.status(403).json({
        message:
          'Password mismatch. Please update your password using the forgot password link.',
      });
    } else {
      isPasswordValid = hash.verify(password, user.salt, user.password);
    }

    if (!isPasswordValid)
      return res.status(422).json(
        validationErrors([
          {
            message: 'Invalid username or password',
            path: 'username_or_email',
          },
          { message: 'Invalid username or password', path: 'password' },
        ]),
      );

    if (!user.verified)
      return res
        .status(400)
        .json({ message: 'Please verify your email address first' });

    const { query, values } = keyBinder(
      `
        UPDATE
          api__users
        SET
          last_login_at = :date
        WHERE
          id = :id
      `,
      { date, id: user.id },
    );

    await db.query(query, values);

    const token = jwt.sign(user, remember).toString();

    return res.status(200).json({ token });
  },
);

const register = catchAsync(
  async (req: RequestValidator<Register>, res: Response) => {
    const type = VerificationKind.VERIFY_EMAIL;
    const email = req.validator.data.email;
    const username = req.validator.data.username;
    const password = req.validator.data.password;
    const date = dayjs.utc().toISOString();
    const expires = dayjs.utc().add(1, 'hour').toISOString();

    const emailQuery = keyBinder(
      `
        SELECT
          email
        FROM
          api__users
        WHERE
          email = :email
      `,
      { email },
    );

    const emailResp = await db.query(emailQuery.query, emailQuery.values);
    const emailUser = emailResp.rows?.[0];

    if (emailUser)
      return res
        .status(422)
        .json(
          validationErrors([
            { message: 'Email already in use', path: 'email' },
          ]),
        );

    const usernameQuery = keyBinder(
      `
        SELECT
          username
        FROM
          api__users
        WHERE
          username = :username
      `,
      { username },
    );

    const usernameResp = await db.query(
      usernameQuery.query,
      usernameQuery.values,
    );
    const usernameUser = usernameResp.rows?.[0];

    if (usernameUser)
      return res
        .status(422)
        .json(
          validationErrors([
            { message: 'Username already in use', path: 'username' },
          ]),
        );

    // DB Transaction
    const client = await db.connect();

    try {
      // DB Transaction Begin
      await client.query('BEGIN');

      const { hashedPassword, salt } = hash.make(password);
      const userQuery = keyBinder(
        `
          INSERT INTO
            api__users(
              email,
              username,
              password,
              salt,
              created_at,
              updated_at
            )
          VALUES(
            :email,
            :username,
            :hashedPassword,
            :salt,
            :date,
            :date
          )
          RETURNING *
        `,
        { date, email, hashedPassword, salt, username },
      );

      const userResp = await client.query(userQuery.query, userQuery.values);
      const user = userResp.rows?.[0];

      const code = crypto.randomBytes(8).toString('hex');
      const verifyQuery = keyBinder(
        `
          INSERT INTO
            api__verifications(
              user_id,
              type,
              email,
              code,
              created_at,
              expires_at
            )
          VALUES(
            :user,
            :type,
            :email,
            :code,
            :date,
            :expires
          )
        `,
        { code, date, email, expires, type, user: user.id },
      );

      await client.query(verifyQuery.query, verifyQuery.values);
      await emailQueue.add(type, { code, email });

      // DB Transaction Commit
      await client.query('COMMIT');
    } catch (e) {
      // DB Transaction Rollback
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return res.status(201).end();
  },
);

const resend = catchAsync(
  async (req: RequestValidator<Resend>, res: Response) => {
    const type = VerificationKind.VERIFY_EMAIL;
    const email = req.validator.data.email;
    const date = dayjs.utc().toISOString();
    const expires = dayjs.utc().add(1, 'hour').toISOString();

    const userQuery = keyBinder(
      `
          SELECT
            u.*,
            v.verifications
          FROM
            api__users u
            LEFT JOIN LATERAL (
              SELECT
                coalesce(json_agg(v_wrap), '[]') AS verifications
              FROM
                (
                  SELECT
                    *
                  FROM
                    api__verifications v
                  WHERE
                    v.type = :type
                    AND v.user_id = u.id
                ) as v_wrap
            ) v ON TRUE
          WHERE
            u.email = :email
        `,
      { email, type },
    );

    const userResp = await db.query(userQuery.query, userQuery.values);
    const user = userResp?.rows?.[0];

    if (!user)
      return res
        .status(422)
        .json(validationErrors([{ message: 'Invalid email', path: 'email' }]));

    let code: string;

    if (user.verifications?.length) {
      code = user.verifications[0].code;
    } else {
      code = crypto.randomBytes(8).toString('hex');
      const verifyQuery = keyBinder(
        `
            INSERT INTO
              api__verifications(
                user_id,
                type,
                email,
                code,
                created_at,
                expires_at
              )
            VALUES(
              :user,
              :type,
              :email,
              :code,
              :date,
              :expires
            )
          `,
        { code, date, email, expires, type, user: user.id },
      );

      await db.query(verifyQuery.query, verifyQuery.values);
    }

    await emailQueue.add(type, { code, email });

    return res.status(200).end();
  },
);

const verify = catchAsync(
  async (req: RequestValidator<Verify>, res: Response) => {
    const type = VerificationKind.VERIFY_EMAIL;
    const email = req.validator.data.email;
    const code = req.validator.data.code;

    const userQuery = keyBinder(
      `
        SELECT
          u.*
        FROM
          api__verifications v
          INNER JOIN api__users u ON u.id = v.user_id
        WHERE
          v.type = :type
          AND v.email = :email
          AND v.code = :code
      `,
      { code, email, type },
    );

    const userResp = await db.query(userQuery.query, userQuery.values);
    const user = userResp?.rows?.[0];

    if (!user)
      return res.status(422).json(
        validationErrors([
          { message: 'Invalid email or verification code', path: 'email' },
          { message: 'Invalid email or verification code', path: 'code' },
        ]),
      );

    // DB Transaction
    const client = await db.connect();

    try {
      // DB Transaction Begin
      await client.query('BEGIN');

      const updateQuery = keyBinder(
        `
          UPDATE
            api__users
          SET
            verified = TRUE
          WHERE
            id = :id
        `,
        { id: user.id },
      );

      await client.query(updateQuery.query, updateQuery.values);

      const deleteQuery = keyBinder(
        `
          DELETE FROM
            api__verifications
          WHERE
            user_id = :user
        `,
        { user: user.id },
      );

      await client.query(deleteQuery.query, deleteQuery.values);

      // DB Transaction Commit
      await client.query('COMMIT');
    } catch (e) {
      // DB Transaction Rollback
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const token = jwt.sign(user, true).toString();

    return res.status(200).json({ token });
  },
);

const forgot = catchAsync(
  async (req: RequestValidator<Forgot>, res: Response) => {
    const type = VerificationKind.RESET_PASSWORD;
    const email = req.validator.data.email;
    const date = dayjs.utc().toISOString();
    const expires = dayjs.utc().add(1, 'hour').toISOString();

    const userQuery = keyBinder(
      `
        SELECT
          u.*,
          v.verifications
        FROM
          api__users u
          LEFT JOIN LATERAL (
            SELECT
              coalesce(json_agg(v_wrap), '[]') AS verifications
            FROM
              (
                SELECT
                  *
                FROM
                  api__verifications v
                WHERE
                  v.type = :type
                  AND v.user_id = u.id
              ) as v_wrap
          ) v ON TRUE
        WHERE
          u.email = :email
      `,
      { email, type },
    );

    const userResp = await db.query(userQuery.query, userQuery.values);
    const user = userResp?.rows?.[0];

    if (!user)
      return res
        .status(422)
        .json(validationErrors([{ message: 'Invalid email', path: 'email' }]));

    let code: string;

    if (user.verifications?.length) {
      code = user.verifications[0].code;
    } else {
      code = crypto.randomBytes(8).toString('hex');
      const verifyQuery = keyBinder(
        `
          INSERT INTO
            api__verifications(
              user_id,
              type,
              email,
              code,
              created_at,
              expires_at
            )
          VALUES(
            :user,
            :type,
            :email,
            :code,
            :date,
            :expires
          )
        `,
        { code, date, email, expires, type, user: user.id },
      );

      await db.query(verifyQuery.query, verifyQuery.values);
    }

    await emailQueue.add(type, { code, email });

    return res.status(200).end();
  },
);

const reset = catchAsync(
  async (req: RequestValidator<Reset>, res: Response) => {
    const type = VerificationKind.RESET_PASSWORD;
    const email = req.validator.data.email;
    const code = req.validator.data.code;
    const password = req.validator.data.password;
    const date = dayjs.utc().toISOString();

    const userQuery = keyBinder(
      `
        SELECT
          u.*
        FROM
          api__verifications v
          INNER JOIN api__users u ON u.id = v.user_id
        WHERE
          v.type = :type
          AND v.email = :email
          AND v.code = :code
      `,
      { code, email, type },
    );

    const userResp = await db.query(userQuery.query, userQuery.values);
    const user = userResp?.rows?.[0];

    if (!user)
      return res.status(422).json(
        validationErrors([
          { message: 'Invalid email or verification code', path: 'email' },
          { message: 'Invalid email or verification code', path: 'code' },
        ]),
      );

    // DB Transaction
    const client = await db.connect();

    try {
      // DB Transaction Begin
      await client.query('BEGIN');

      const { hashedPassword, salt } = hash.make(password);
      const updateQuery = keyBinder(
        `
          UPDATE
            api__users
          SET
            password = :password,
            salt = :salt,
            updated_at = :date
          WHERE
            id = :id
        `,
        { date, id: user.id, password: hashedPassword, salt },
      );

      await client.query(updateQuery.query, updateQuery.values);

      const deleteQuery = keyBinder(
        `
          DELETE FROM
            api__verifications
          WHERE
            user_id = :user
        `,
        { type, user: user.id },
      );

      await client.query(deleteQuery.query, deleteQuery.values);

      // DB Transaction Commit
      await client.query('COMMIT');
    } catch (e) {
      // DB Transaction Rollback
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return res.status(200).end();
  },
);

export default { forgot, login, register, resend, reset, verify };
