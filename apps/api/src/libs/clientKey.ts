import { isIPv4, isIPv6 } from 'node:net';

const MAPPED_V4 = '::ffff:';

/** Expand an IPv6 address into its 8 hextets (no zone, lowercase). */
const hextets = (address: string): string[] => {
  const [head, tail] = address.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const fill =
    tail === undefined ? [] : Array(8 - left.length - right.length).fill('0');
  return [...left, ...fill, ...right].map(
    (part) => parseInt(part, 16).toString(16) || '0',
  );
};

/**
 * Rate-limit key for an anonymous client. An IPv6 client usually controls a
 * whole /64 and can rotate within it, so all of it shares one counter; IPv4
 * (including IPv4-mapped IPv6) stays per address.
 */
export const anonymousClientKey = (address: string): string => {
  if (address.toLowerCase().startsWith(MAPPED_V4)) {
    const v4 = address.slice(MAPPED_V4.length);
    if (isIPv4(v4)) return v4;
  }
  const bare = address.split('%')[0];
  if (!isIPv6(bare)) return address;
  return `${hextets(bare.toLowerCase()).slice(0, 4).join(':')}::/64`;
};
