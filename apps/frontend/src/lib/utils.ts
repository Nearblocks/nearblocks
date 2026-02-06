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

export const nearIcon = `<svg class="fill-foreground size-4 inline-block align-middle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10 10 10 0 1 1-20 0A10 10 0 0 1 12 2M8.06 7C7.49 7 7 7.48 7 8.06v7.87a1.07 1.07 0 0 0 1.97.56l2.1-3.1a.22.22 0 0 0-.34-.3l-2.05 1.8a.08.08 0 0 1-.14-.07V9.23a.08.08 0 0 1 .14-.05l6.22 7.44q.32.37.82.38h.21c.6 0 1.07-.47 1.07-1.06V8.07c0-.6-.48-1.07-1.06-1.07h-.14q-.5.08-.77.5l-2.1 3.11a.22.22 0 0 0 .34.3l2.05-1.8a.08.08 0 0 1 .14.07v5.59a.1.1 0 0 1-.08.08l-.06-.03L9.1 7.38A1 1 0 0 0 8.28 7z"/></svg>`;

export const downloadWasm = (contract: string, base64String: string) => {
  try {
    const byteArray = Buffer.from(base64String, 'base64');
    const blob = new Blob([byteArray], { type: 'application/wasm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contract}.wasm`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
};

export const getCommitHash = (url: string) => {
  const match = url.match(/[0-9a-f]{40}$/i) || url.match(/rev=([0-9a-f]{40})/i);
  const hash = match?.[1] || match?.[0] || null;

  return hash ? hash : url.slice(0, 40);
};
