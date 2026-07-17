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

const readVarU32 = (bytes: Uint8Array, offset: number): [number, number] => {
  let result = 0;
  let shift = 0;

  while (offset < bytes.length) {
    const byte = bytes[offset++];
    result |= (byte & 0x7f) << shift;

    if ((byte & 0x80) === 0) break;

    shift += 7;
  }

  return [result >>> 0, offset];
};

const readWasmProducersLanguage = (bytes: Uint8Array): null | string => {
  // magic '\0asm' + version
  if (
    bytes.length < 8 ||
    bytes[0] !== 0x00 ||
    bytes[1] !== 0x61 ||
    bytes[2] !== 0x73 ||
    bytes[3] !== 0x6d
  ) {
    return null;
  }

  const decoder = new TextDecoder();
  let offset = 8;

  while (offset < bytes.length) {
    const sectionId = bytes[offset++];
    let sectionSize: number;
    [sectionSize, offset] = readVarU32(bytes, offset);
    const sectionEnd = offset + sectionSize;

    if (sectionId === 0) {
      let nameLength: number;
      [nameLength, offset] = readVarU32(bytes, offset);
      const name = decoder.decode(bytes.subarray(offset, offset + nameLength));
      offset += nameLength;

      if (name === 'producers') {
        let fieldCount: number;
        [fieldCount, offset] = readVarU32(bytes, offset);

        for (let i = 0; i < fieldCount && offset < sectionEnd; i++) {
          let fieldNameLength: number;
          [fieldNameLength, offset] = readVarU32(bytes, offset);
          const fieldName = decoder.decode(
            bytes.subarray(offset, offset + fieldNameLength),
          );
          offset += fieldNameLength;

          let valueCount: number;
          [valueCount, offset] = readVarU32(bytes, offset);

          for (let j = 0; j < valueCount && offset < sectionEnd; j++) {
            let valueLength: number;
            [valueLength, offset] = readVarU32(bytes, offset);
            const value = decoder.decode(
              bytes.subarray(offset, offset + valueLength),
            );
            offset += valueLength;

            let versionLength: number;
            [versionLength, offset] = readVarU32(bytes, offset);
            offset += versionLength;

            if (fieldName === 'language' && value) return value;
          }
        }

        return null;
      }
    }

    offset = sectionEnd;
  }

  return null;
};

// SDKs embedding an interpreter (MicroPython, QuickJS, .NET) are themselves
// compiled from C/Rust, so those markers must be checked first
const wasmLanguageMarkers: [language: string, markers: string[]][] = [
  ['Python', ['micropython']],
  // QuickJS embeds its builtin atom table; AssemblyScript stores strings as UTF-16LE
  ['JavaScript', ['quickjs', 'near_sdk_js', 'getownpropertydescriptor']],
  ['C#', ['system.private.corelib', 'dotnetjs']],
  ['AssemblyScript', ['~lib/', 'assemblyscript', '~\0l\0i\0b\0/\0']],
  ['Rust', ['rustc', 'cargo/registry', 'near-sdk', 'near_sdk', 'lib.rs']],
  ['Go', ['tinygo', 'go.runtime']],
  ['C/C++', ['emscripten']],
  ['Zig', ['ziglang']],
];

export const detectWasmLanguage = (bytes: Uint8Array): null | string => {
  try {
    const producersLanguage = readWasmProducersLanguage(bytes);

    if (producersLanguage) return producersLanguage;

    const text = Buffer.from(bytes).toString('latin1').toLowerCase();

    for (const [language, markers] of wasmLanguageMarkers) {
      if (markers.some((marker) => text.includes(marker))) return language;
    }

    return null;
  } catch {
    return null;
  }
};

export const getCommitHash = (url: string) => {
  const match = url.match(/[0-9a-f]{40}$/i) || url.match(/rev=([0-9a-f]{40})/i);
  const hash = match?.[1] || match?.[0] || null;

  return hash ? hash : url.slice(0, 40);
};

export const encodeToken = (token: string) => encodeURIComponent(token);

export const decodeToken = (token: string) => {
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
};

export const isSpamToken = (contract: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => {
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(2);

      return contract === suffix || contract.endsWith(`.${suffix}`);
    }

    return contract === pattern;
  });
};
