/**
 * Models with dynamoose's `expires` option type `expiresAt` as Date, so
 * reads return a Date even though it's written as epoch seconds. These
 * helpers normalize either shape to epoch milliseconds before comparing.
 */
const toEpochMillis = (expiresAt: number | Date): number =>
  expiresAt instanceof Date ? expiresAt.getTime() : expiresAt * 1000;

export const isExpired = (expiresAt?: number | Date | null): boolean =>
  Boolean(expiresAt) && Date.now() > toEpochMillis(expiresAt as number | Date);

export const isNotExpired = (expiresAt?: number | Date | null): boolean =>
  Boolean(expiresAt) && Date.now() <= toEpochMillis(expiresAt as number | Date);
