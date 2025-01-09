import db from '#libs/db';
import logger from '#libs/logger';
import Sentry from '#libs/sentry';
import { ValidationError } from '#types/types';

export const getPagination = (page = 1, perPage = 25) => {
  return {
    limit: perPage,
    offset: (page - 1) * perPage,
  };
};

export const keyBinder = (
  raw: string,
  bindings: Record<string, number | string>,
  format = false,
) => {
  let index = 0;
  const values: (number | string)[] = [];
  const params: string[] = [];
  const regex = /:(\w+)/g;

  let query = raw.replace(regex, function (match, group) {
    if (group in bindings) {
      index++;
      values.push(bindings[group]);

      if (format) {
        params.push(`$${index}::text`);
      }

      return format ? '%L' : `$${index}`;
    }

    throw new Error(`missing parameter binding for ${match}`);
  });

  if (format) {
    query = params.length
      ? `format('${query}', ${params.join(', ')})`
      : `'${query}'`;
  }

  return {
    query,
    values,
  };
};

export const validationErrors = (errors: ValidationError[]) => {
  return {
    errors: errors.map((error) => ({
      message: error.message,
      path: [error.path],
    })),
  };
};

export const getFreePlan = async () => {
  const { rows } = await db.query(
    `
      SELECT
        *
      FROM
        api__plans
      WHERE
        id = 1
    `,
  );

  return rows?.[0];
};

export const errorHandler = (error: Error) => {
  logger.error(error);
  Sentry.captureException(error);
};
