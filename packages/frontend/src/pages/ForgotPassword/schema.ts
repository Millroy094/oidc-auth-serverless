import { z } from 'zod';

const schema = z
  .object({
    email: z.string().min(1, 'This field is required').email(),
    emailSent: z.boolean(),
    otp: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.emailSent) {
      return;
    }

    if (!data.otp) {
      ctx.addIssue({
        code: 'custom',
        path: ['otp'],
        message: 'OTP is Required',
      });
    } else if (!/^\d*$/.test(data.otp)) {
      ctx.addIssue({
        code: 'custom',
        path: ['otp'],
        message: 'OTP must be number',
      });
    } else if (data.otp.length !== 6) {
      ctx.addIssue({
        code: 'custom',
        path: ['otp'],
        message: 'OTP must be 6 digits',
      });
    }

    if (!data.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password is required',
      });
    } else if (data.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Must Contain 8 Characters',
      });
    } else if (!/^(?=.*[a-z])/.test(data.password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Must Contain One Lowercase Character',
      });
    } else if (!/^(?=.*[A-Z])/.test(data.password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Must Contain One Uppercase Character',
      });
    } else if (!/^(?=.*\d)/.test(data.password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Must Contain One Number Character',
      });
    } else if (!/^(?=.*[!@#$%^&*])/.test(data.password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Must Contain  One Special Case Character',
      });
    }

    if (!data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Password confirmation is required',
      });
    } else if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords must match',
      });
    }
  });

export default schema;
