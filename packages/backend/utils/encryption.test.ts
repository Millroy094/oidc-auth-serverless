import { encryptData, decryptData } from './encryption';

describe('Encryption Service', () => {
  const testString = 'Sensitive Data';
  let encryptedData: string;

  it('should encrypt data correctly', () => {
    encryptedData = encryptData(testString);
    expect(typeof encryptedData).toBe('string');
    expect(encryptedData).not.toBe(testString);
  });

  it('should decrypt data back to original string', () => {
    const decryptedData = decryptData(encryptedData);
    expect(decryptedData).toBe(testString);
  });

  it('should throw an error if decryption is attempted on invalid data', () => {
    expect(() => decryptData('invalidBase64String')).toThrow();
  });
});
