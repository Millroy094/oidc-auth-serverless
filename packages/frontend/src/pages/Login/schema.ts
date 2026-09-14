import * as yup from 'yup';

const schema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
    mfaType: yup.string(),
    otp: yup
      .string()
      .when(['mfaType', 'loginWithRecoveryCode'], (fields, schema) => {
        const [mfaType, loginWithRecoveryCode] = fields;
        return mfaType && mfaType !== 'passkey' && !loginWithRecoveryCode
          ? schema.required().min(6)
          : schema;
      }),
    loginWithRecoveryCode: yup.boolean().required(),
    recoveryCode: yup
      .string()
      .when('loginWithRecoveryCode', (fields, schema) => {
        const [loginWithRecoveryCode] = fields;
        return loginWithRecoveryCode
          ? schema.required('Recovery code is required')
          : schema;
      }),
    resetMfa: yup.boolean(),
  })
  .required();

export default schema;
