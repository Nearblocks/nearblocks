import Big from 'big.js';
import { format } from 'numerable';

import logger from '#libs/logger';
import Sentry from '#libs/sentry';
import { mainnetDb } from '#libs/db';
import { ValidationError } from '#ts/types';

Big.NE = -18;
const MS_PER_NS = Big(10).pow(6);
const YOCTO_PER_NEAR = Big(10).pow(24);

export const getPagination = (page = 1, perPage = 25) => {
  return {
    limit: perPage,
    offset: (page - 1) * perPage,
  };
};

export const keyBinder = (raw: string, bindings: any, format = false) => {
  let index = 0;
  const values: any[] = [];
  const params: any[] = [];
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

export const yoctoToNear = (yocto: string) =>
  Big(yocto).div(YOCTO_PER_NEAR).toString();

export const msToNsTime = (ms: string | number) =>
  Big(ms).mul(MS_PER_NS).toString();

export const nsToMsTime = (ns: string | number) =>
  Big(ns).div(Big(10).pow(6)).toString();

export const tokenAmount = (amount: string, decimals: number) =>
  Big(amount).div(Big(10).pow(decimals)).toString();

export const localFormat = (string: string, decimals = 8) =>
  format(string, `0,0.${'#'.repeat(decimals)}`);

export const validationErrors = (errors: ValidationError[]) => {
  return {
    errors: errors.map((error) => ({
      path: [error.path],
      message: error.message,
    })),
  };
};

export const getFreePlan = async () => {
  const { rows } = await mainnetDb.query(
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
