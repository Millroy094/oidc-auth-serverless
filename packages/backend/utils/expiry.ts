/**
 * dynamoose stores `expiresAt` values as plain epoch-seconds numbers, but
 * any model configured with the `expires` table option internally types
 * that attribute as Date. As a result, values written as numbers are read
 * back as Date instances. This helper normalizes either representation to
 * epoch milliseconds so expiry comparisons are correct regardless of which
 * shape dynamoose hands back.
 */
const toEpochMillis = (expiresAt: number | Date): number =>
  expiresAt instanceof Date ? expiresAt.getTime() : expiresAt * 1000;

export const isExpired = (expiresAt?: number | Date | null): boolean =>
  Boolean(expiresAt) && Date.now() > toEpochMillis(expiresAt as number | Date);

export const isNotExpired = (expiresAt?: number | Date | null): boolean =>
  Boolean(expiresAt) && Date.now() <= toEpochMillis(expiresAt as number | Date);
