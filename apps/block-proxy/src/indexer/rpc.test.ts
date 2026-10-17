import { describe, expect, it } from 'vitest';

import { parseJsonPreservingUnsafeIntegers } from './rpc.js';

describe('lossless RPC integer parsing', () => {
  it('retains unsafe integer tokens while leaving strings and safe numbers intact', () => {
    const source =
      '{"safe":9007199254740991,"negative":-9007199254740992,' +
      '"max":18446744073709551615,"text":"height:18446744073709551615"}';
    const result =
      parseJsonPreservingUnsafeIntegers<Record<string, unknown>>(source);
    expect(result.safe).toBe(9007199254740991);
    expect(result.text).toBe('height:18446744073709551615');
    expect(JSON.stringify(result)).toBe(source);
  });
});
