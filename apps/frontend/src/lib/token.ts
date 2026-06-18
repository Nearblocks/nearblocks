type ParsedTokenId =
  | { contract: string; token: string; type: 'nft' }
  | { contract: string; type: 'ft' }
  | { type: 'unknown' };

export const parseMTToken = (token: string): ParsedTokenId => {
  if (/^nep141:/i.test(token)) {
    return { contract: token.slice('nep141:'.length), type: 'ft' };
  }

  if (/^nep171:/i.test(token)) {
    const rest = token.slice('nep171:'.length);
    const sep = rest.indexOf(':');

    if (sep === -1) return { type: 'unknown' };

    return {
      contract: rest.slice(0, sep),
      token: rest.slice(sep + 1),
      type: 'nft',
    };
  }

  if (/^nep245:/i.test(token)) {
    const rest = token.slice('nep245:'.length);
    const sep = rest.indexOf(':');

    if (sep === -1) return { type: 'unknown' };

    const innerPart = rest.slice(sep + 1);
    const inner = parseMTToken(innerPart);

    if (inner.type !== 'unknown') return inner;

    return { type: 'unknown' };
  }

  return { type: 'unknown' };
};
