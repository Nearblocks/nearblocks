/**
 * Convert a camelCase string to snake_case.
 *
 * Keys that start with an uppercase letter (PascalCase) are preserved as-is.
 * NEAR protocol data uses PascalCase for Rust enum variant tags
 * (e.g. "Action", "FunctionCall", "SuccessReceiptId"); those tags remain
 * unchanged while ordinary field names are normalized to snake_case.
 */
const camelToSnake = (str: string): string => {
  // Preserve PascalCase enum variant tags (first char is uppercase)
  if (str.length > 0 && str[0] >= 'A' && str[0] <= 'Z') return str;
  // Convert camelCase to snake_case: "signerId" -> "signer_id"
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Recursively convert all object keys from camelCase to snake_case.
 * PascalCase keys (Rust enum variant tags) are preserved unchanged.
 *
 * Used by the S3 upstream to normalize JSON written by indexer-base.
 */
export const snakeCaseKeys = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(snakeCaseKeys) as T;
  const newObj: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    newObj[camelToSnake(key)] = snakeCaseKeys(value);
  }
  return newObj as T;
};
