import { z } from 'zod';

const schema = z
  .object({
    email: z.string().min(1, 'This field is required').email(),
    password: z.string().min(1, 'This field is required'),
    mfaType: z.string().optional(),
    otp: z.string().optional(),
    loginWithRecoveryCode: z.boolean(),
    recoveryCode: z.string().optional(),
    resetMfa: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.mfaType &&
      data.mfaType !== 'passkey' &&
      !data.loginWithRecoveryCode
    ) {
      if (!data.otp) {
        ctx.addIssue({
          code: 'custom',
          path: ['otp'],
          message: 'This field is required',
        });
      } else if (data.otp.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['otp'],
          message: 'String must contain at least 6 character(s)',
        });
      }
    }

    if (data.loginWithRecoveryCode && !data.recoveryCode) {
      ctx.addIssue({
        code: 'custom',
        path: ['recoveryCode'],
        message: 'Recovery code is required',
      });
    }
  });

export default schema;
