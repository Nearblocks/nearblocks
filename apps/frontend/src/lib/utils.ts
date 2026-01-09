import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { SearchParams } from '@/types/types';

const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'headline-xs',
        'headline-sm',
        'headline-base',
        'headline-lg',
        'headline-xl',
        'headline-2xl',
        'headline-3xl',
        'headline-4xl',
        'headline-5xl',
        'body-xs',
        'body-sm',
        'body-base',
        'body-lg',
        'body-xl',
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => {
  return merge(clsx(inputs));
};

export const buildParams = (
  current: SearchParams | URLSearchParams,
  updates: SearchParams = {},
): URLSearchParams => {
  const isEmpty = (value: unknown): boolean =>
    value === null || value === undefined || value === '';

  let normalized: SearchParams = {};

  if (current instanceof URLSearchParams) {
    for (const [key, value] of current.entries()) {
      normalized[key] = value;
    }
  } else if (current) {
    normalized = { ...current };
  }

  const merged = { ...normalized, ...updates };
  const result = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (Array.isArray(value)) {
      value
        .filter((v) => !isEmpty(v))
        .forEach((v) => {
          result.append(key, String(v));
        });
    } else if (!isEmpty(value)) {
      result.set(key, String(value));
    }
  }

  return result;
};
