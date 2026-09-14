import * as yup from 'yup';
import isPhoneValid from '../../../../utils/is-phone-valid';

const schema = yup
  .object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    email: yup.string().email().required(),
    emailVerified: yup.boolean().required(),
    mobile: yup
      .string()
      .test('is-phone-valid', 'Please enter a valid number', (value) =>
        isPhoneValid(value as string),
      ),
    roles: yup.array(yup.string().required()).required(),
    suspended: yup.boolean().required(),
  })
  .required();

export default schema;
