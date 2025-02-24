import crypto from 'node:crypto';

import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import hash from '#libs/hash';
import jwt from '#libs/jwt';
import { emailQueue } from '#libs/queue';
import { stats } from '#libs/rateLimiter';
import { Destroy, Email, Password, UpdateEmail } from '#libs/schema/profile';
import { transformUser } from '#libs/transform';
import { getFreePlan, keyBinder, validationErrors } from '#libs/utils';
import { SubscriptionStatus, VerificationKind } from '#types/enums';
import { Plan, RequestValidator, User } from '#types/types';

const info = catchAsync(async (req: Request, res: Response) => {
  const id = (req.user as User).id;
  const date = dayjs.utc().toISOString();

  const userQuery = keyBinder(
    `
      SELECT
        u.*,
        row_to_json(p) as plan,
        k.keys
      FROM
        api__users u
        LEFT JOIN LATERAL (
          SELECT
            p.*
          FROM
            api__plans p
            INNER JOIN api__subscriptions s ON s.plan_id = p.id
          WHERE
            s.user_id = u.id
            AND s.status IN ('${SubscriptionStatus.ACTIVE}', '${SubscriptionStatus.TRIALING}')
            AND p.type = 0
          ORDER BY
            s.end_date DESC
          LIMIT
            1
        ) p ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            coalesce(json_agg(k_wrap), '[]') AS keys
          FROM
            (
              SELECT
                *
              FROM
                api__keys k
              WHERE
                k.user_id = u.id
            ) as k_wrap
        ) k ON TRUE
      WHERE
        u.id = :id
    `,
    { date, id },
  );

  const { rows } = await db.query(userQuery.query, userQuery.values);
  const user = rows?.[0];

  if (!user) return res.status(404).end();

  if (!user.plan) {
    user.plan = await getFreePlan();
  }
  const rateLimit = await stats(user.plan as Plan, user);

  return res
    .status(200)
    .json({ 'rate-limit': rateLimit, user: transformUser(user) });
});

const email = catchAsync(
  async (req: RequestValidator<Email>, res: Response) => {
    const user = req.user as User;
    const type = VerificationKind.UPDATE_EMAIL;
    const email = req.validator.data.email;
    const date = dayjs.utc().toISOString();
    const expires = dayjs.utc().add(1, 'hour').toISOString();

    if (user.email === email) {
      return res.status(204).end();
    }

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

    const verifyQuery = keyBinder(
      `
        SELECT
          *
        FROM
          api__verifications
        WHERE
          user_id = :user
      `,
      { user: user.id },
    );

    const verifyResp = await db.query(verifyQuery.query, verifyQuery.values);
    const verify = verifyResp?.rows?.[0];

    if (verify)
      return res
        .status(400)
        .json({ message: 'Email update request already exists' });

    const code = crypto.randomBytes(8).toString('hex');
    const insertQuery = keyBinder(
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

    await db.query(insertQuery.query, insertQuery.values);
    await emailQueue.add(type, { code, email, old_email: user.email });

    return res.status(200).end();
  },
);

const updateEmail = catchAsync(
  async (req: RequestValidator<UpdateEmail>, res: Response) => {
    const type = VerificationKind.UPDATE_EMAIL;
    const email = req.validator.data.email;
    const code = req.validator.data.code;
    const date = dayjs.utc().toISOString();

    const verifyQuery = keyBinder(
      `
        SELECT
          *
        FROM
          api__verifications
        WHERE
          type = :type
          AND email = :email
          AND code = :code
      `,
      { code, email, type },
    );

    const userResp = await db.query(verifyQuery.query, verifyQuery.values);
    const verify = userResp?.rows?.[0];

    if (!verify)
      return res.status(422).json(
        validationErrors([
          { message: 'Invalid email or verification code', path: 'email' },
          { message: 'Invalid email or verification code', path: 'code' },
        ]),
      );

    const userQuery = keyBinder(
      `
            SELECT
              *
            FROM
              api__users
            WHERE
              id = :user_id
          `,
      { user_id: verify.user_id },
    );

    const resp = await db.query(userQuery.query, userQuery.values);
    const user = resp?.rows?.[0];

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

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
            email = :email,
            updated_at = :date
          WHERE
            id = :id
        `,
        { date, email, id: verify.user_id },
      );

      await client.query(updateQuery.query, updateQuery.values);

      const deleteQuery = keyBinder(
        `
          DELETE FROM
            api__verifications
          WHERE
            user_id = :user
        `,
        { user: verify.user_id },
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

const password = catchAsync(
  async (req: RequestValidator<Password>, res: Response) => {
    const id = (req.user as User).id;
    const password = req.validator.data.password;
    const oldPassword = req.validator.data.old_password;
    const date = dayjs.utc().toISOString();

    if (password === oldPassword) {
      return res.status(204).end();
    }

    const userQuery = keyBinder(
      `
        SELECT
          *
        FROM
          api__users
        WHERE
          id = :id
      `,
      { id },
    );

    const { rows } = await db.query(userQuery.query, userQuery.values);
    const user = rows?.[0];

    if (!user || !hash.verify(oldPassword, user.salt, user.password))
      return res
        .status(422)
        .json(
          validationErrors([
            { message: 'Invalid old password', path: 'password' },
          ]),
        );

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
      { date, id, password: hashedPassword, salt },
    );

    await db.query(updateQuery.query, updateQuery.values);

    return res.status(200).end();
  },
);

const destroy = catchAsync(
  async (req: RequestValidator<Destroy>, res: Response) => {
    const id = (req.user as User).id;
    const password = req.validator.data.password;

    const userQuery = keyBinder(
      `
        SELECT
          *
        FROM
          api__users
        WHERE
          id = :id
      `,
      { id },
    );

    const { rows } = await db.query(userQuery.query, userQuery.values);
    const user = rows?.[0];

    if (!user || !hash.verify(password, user.salt, user.password))
      return res
        .status(422)
        .json(
          validationErrors([{ message: 'Invalid password', path: 'password' }]),
        );

    const deleteQuery = keyBinder(
      `
        DELETE FROM
          api__users
        WHERE
          id = :id
      `,
      { id },
    );

    await db.query(deleteQuery.query, deleteQuery.values);

    return res.status(200).end();
  },
);

export default { destroy, email, info, password, updateEmail };
