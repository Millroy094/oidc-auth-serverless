import * as yup from 'yup';
import isPhoneValid from '../../utils/is-phone-valid';

const schema = yup
  .object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    email: yup.string().email().required(),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Must Contain 8 Characters')
      .matches(/^(?=.*[a-z])/, 'Must Contain One Lowercase Character')
      .matches(/^(?=.*[A-Z])/, 'Must Contain One Uppercase Character')
      .matches(/^(?=.*\d)/, 'Must Contain One Number Character')
      .matches(/^(?=.*[!@#$%^&*])/, 'Must Contain  One Special Case Character'),
    confirmPassword: yup
      .string()
      .required('Password confirmation is required')
      .oneOf([yup.ref('password')], 'Passwords must match'),
    mobile: yup
      .string()
      .test('is-phone-valid', 'Please enter a valid number', (value) =>
        isPhoneValid(value as string),
      ),
  })
  .required();

export default schema;
