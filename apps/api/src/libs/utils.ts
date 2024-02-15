/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRequire } from 'module';

import Big from 'big.js';
import { format } from 'numerable';
import { readCustomSection } from 'wasm-walrus-tools';

import logger from '#libs/logger';
import Sentry from '#libs/sentry';
import { ValidationError } from '#types/types';

const require = createRequire(import.meta.url);
const brotli = require('brotli-wasm');

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
  const values: unknown[] = [];
  const params: unknown[] = [];
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

export const msToNsTime = (ms: number | string) =>
  Big(ms).mul(MS_PER_NS).toString();

export const nsToMsTime = (ns: number | string) =>
  Big(ns).div(Big(10).pow(6)).toString();

export const tokenAmount = (amount: string, decimals: number) =>
  Big(amount).div(Big(10).pow(decimals)).toString();

export const localFormat = (string: string, decimals = 8) =>
  format(string, `0,0.${'#'.repeat(decimals)}`);

export const validationErrors = (errors: ValidationError[]) => {
  return {
    errors: errors.map((error) => ({
      message: error.message,
      path: [error.path],
    })),
  };
};

export const errorHandler = (error: Error) => {
  logger.error(error);
  Sentry.captureException(error);
};

export const cmp = (a: Big, b: Big) => {
  if (a.eq(b)) return 0;
  if (a.gt(b)) return 1;

  return -1;
};

export const sortByBNComparison = (aValue?: string, bValue?: string) => {
  if (aValue !== undefined && bValue !== undefined) {
    // Ensure both values are valid numbers before comparing
    const aNumeric = Big(aValue ?? 0);
    const bNumeric = Big(bValue ?? 0);

    return cmp(bNumeric, aNumeric);
  }

  if (aValue) return -1;
  if (bValue) return 1;

  return 0;
};

export const raenSchema = async (code: string) => {
  const wasm = Buffer.from(code, 'base64');
  const json = await readCustomSection(wasm, 'json');

  if (!json) return null;

  let urlOrData = Buffer.from(json.slice(0, 20)).toString('utf8');

  if (urlOrData.startsWith('https://')) {
    return fetchRaenSchema(Buffer.from(json).toString('utf8'));
  }

  const decompressed = brotli.decompress(json);

  if (!decompressed) return null;

  urlOrData = Buffer.from(decompressed).toString('utf8');

  if (urlOrData.startsWith('https://')) {
    return fetchRaenSchema(Buffer.from(json).toString('utf8'));
  }

  return JSON.parse(urlOrData);
};

export const fetchRaenSchema = async (urlOrData: string) => {
  const response = await fetch(urlOrData);

  if (response.ok) {
    return response.json();
  }

  return null;
};
