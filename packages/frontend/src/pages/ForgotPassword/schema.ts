import * as yup from 'yup';

const schema = yup
  .object({
    email: yup.string().email().required(),
    emailSent: yup.boolean().required(),
    otp: yup.string().when('emailSent', (emailSent, schema) => {
      const [sent] = emailSent;
      return sent
        ? schema
            .required('OTP is Required')
            .matches(/^\d*$/, 'OTP must be number')
            .min(6, 'OTP must be 6 digits')
            .max(6, 'OTP must be 6 digits')
        : schema;
    }),

    password: yup.string().when('emailSent', (emailSent, schema) => {
      const [sent] = emailSent;
      return sent
        ? schema
            .required('Password is required')
            .min(8, 'Must Contain 8 Characters')
            .matches(/^(?=.*[a-z])/, 'Must Contain One Lowercase Character')
            .matches(/^(?=.*[A-Z])/, 'Must Contain One Uppercase Character')
            .matches(/^(?=.*\d)/, 'Must Contain One Number Character')
            .matches(
              /^(?=.*[!@#$%^&*])/,
              'Must Contain  One Special Case Character',
            )
        : schema;
    }),

    confirmPassword: yup.string().when('emailSent', (emailSent, schema) => {
      const [sent] = emailSent;
      return sent
        ? schema
            .required('Password confirmation is required')
            .oneOf([yup.ref('password')], 'Passwords must match')
        : schema;
    }),
  })
  .required();

export default schema;
