import crypto from 'crypto';
import config from '../support/env-config.ts';

const encryptionSecretKey = config.encryption.secret;
const encryptionSecretIV = config.encryption.secretiv;
const encryptionMethod = config.encryption.method;

if (!encryptionSecretKey || !encryptionSecretIV || !encryptionMethod) {
  throw new Error('secret prerequisites missing');
}

const key = crypto
  .createHash('sha512')
  .update(encryptionSecretKey)
  .digest('hex')
  .substring(0, 32);
const encryptionIV = crypto
  .createHash('sha512')
  .update(encryptionSecretIV)
  .digest('hex')
  .substring(0, 16);

export function encryptData(data: string) {
  const cipher = crypto.createCipheriv(encryptionMethod, key, encryptionIV);
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
  ).toString('base64');
}

export function decryptData(encryptedData: string) {
  const buff = Buffer.from(encryptedData, 'base64');
  const decipher = crypto.createDecipheriv(encryptionMethod, key, encryptionIV);
  return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
  );
}
