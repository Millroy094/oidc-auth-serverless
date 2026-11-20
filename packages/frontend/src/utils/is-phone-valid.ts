import { isValidPhoneNumber } from 'libphonenumber-js/max';

const isPhoneValid = (phone: string) => {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
};

export default isPhoneValid;
