import { vi } from 'vitest';
import isPhoneValid from './is-phone-valid';
import { PhoneNumberUtil } from 'google-libphonenumber';

vi.mock('google-libphonenumber', () => {
  const mockPhoneNumberUtil = {
    parseAndKeepRawInput: vi.fn(),
    isValidNumber: vi.fn(),
  };

  return {
    PhoneNumberUtil: {
      getInstance: () => mockPhoneNumberUtil,
    },
  };
});

describe('isPhoneValid', () => {
  const phoneUtil = PhoneNumberUtil.getInstance();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true for a valid phone number', () => {
    const validPhoneNumber = '+14155552671';
    (phoneUtil.parseAndKeepRawInput as jest.Mock).mockReturnValue(
      validPhoneNumber,
    );
    (phoneUtil.isValidNumber as jest.Mock).mockReturnValue(true);

    const result = isPhoneValid(validPhoneNumber);
    expect(result).toBe(true);
    expect(phoneUtil.parseAndKeepRawInput).toHaveBeenCalledWith(
      validPhoneNumber,
    );
    expect(phoneUtil.isValidNumber).toHaveBeenCalled();
  });

  it('should return false for an invalid phone number', () => {
    const invalidPhoneNumber = '123';
    (phoneUtil.parseAndKeepRawInput as jest.Mock).mockReturnValue(
      invalidPhoneNumber,
    );
    (phoneUtil.isValidNumber as jest.Mock).mockReturnValue(false);

    const result = isPhoneValid(invalidPhoneNumber);
    expect(result).toBe(false);
    expect(phoneUtil.parseAndKeepRawInput).toHaveBeenCalledWith(
      invalidPhoneNumber,
    );
    expect(phoneUtil.isValidNumber).toHaveBeenCalled();
  });

  it('should return false if an error is thrown during parsing', () => {
    const errorPhoneNumber = 'invalid-phone-number';
    (phoneUtil.parseAndKeepRawInput as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid phone number format');
    });

    const result = isPhoneValid(errorPhoneNumber);
    expect(result).toBe(false);
    expect(phoneUtil.parseAndKeepRawInput).toHaveBeenCalledWith(
      errorPhoneNumber,
    );
    expect(phoneUtil.isValidNumber).not.toHaveBeenCalled();
  });
});
