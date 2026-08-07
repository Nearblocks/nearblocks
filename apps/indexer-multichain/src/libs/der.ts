const to32Bytes = (buf: Buffer): Buffer => {
  const src = buf.length > 32 ? buf.subarray(buf.length - 32) : buf;

  if (src.length === 32) return Buffer.from(src);

  const out = Buffer.alloc(32);
  src.copy(out, 32 - src.length);

  return out;
};

export const parseScriptSigPushes = (hex: string): null | string[] => {
  const buf = Buffer.from(hex, 'hex');
  const items: string[] = [];

  let offset = 0;
  while (offset < buf.length) {
    const len = buf[offset++];

    if (len === 0 || len > 75 || offset + len > buf.length) return null;

    items.push(buf.subarray(offset, offset + len).toString('hex'));
    offset += len;
  }

  return items;
};

export const decodeDERsignature = (signatureHex: string) => {
  const signature = Buffer.from(signatureHex, 'hex');

  const der = signature.subarray(0, signature.length - 1);

  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('invalid DER format');

  const length = der[offset++];

  if (length + 2 !== der.length) throw new Error('invalid length');
  if (der[offset++] !== 0x02) throw new Error('expected integer for r');

  const rLen = der[offset++];
  const r = der.subarray(offset, offset + rLen);
  offset += rLen;

  if (der[offset++] !== 0x02) throw new Error('expected integer for s');

  const sLen = der[offset++];
  const s = der.subarray(offset, offset + sLen);

  return { r: to32Bytes(r), s: to32Bytes(s) };
};
