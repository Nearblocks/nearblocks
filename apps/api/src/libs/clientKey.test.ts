import { describe, expect, it } from 'vitest';

import { anonymousClientKey } from './clientKey.js';

describe('anonymousClientKey', () => {
  it('keeps IPv4 addresses as they are', () => {
    expect(anonymousClientKey('203.0.113.7')).toBe('203.0.113.7');
  });

  it('unwraps IPv4-mapped IPv6 addresses', () => {
    expect(anonymousClientKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
  });

  it('groups IPv6 addresses by their /64 prefix', () => {
    expect(anonymousClientKey('2a13:9246:f8b5:12:aaaa:bbbb:cccc:dddd')).toBe(
      '2a13:9246:f8b5:12::/64',
    );
    expect(anonymousClientKey('2a13:9246:f8b5:12::1')).toBe(
      '2a13:9246:f8b5:12::/64',
    );
  });

  it('expands compressed and mixed-case IPv6 consistently', () => {
    expect(anonymousClientKey('2001:DB8::1')).toBe('2001:db8:0:0::/64');
    expect(anonymousClientKey('::1')).toBe('0:0:0:0::/64');
    expect(anonymousClientKey('fe80::1%eth0')).toBe('fe80:0:0:0::/64');
  });

  it('returns empty or unparsable input unchanged', () => {
    expect(anonymousClientKey('')).toBe('');
    expect(anonymousClientKey('not-an-ip')).toBe('not-an-ip');
  });
});
