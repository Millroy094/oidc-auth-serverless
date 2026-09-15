import { z } from 'zod';
import isPhoneValid from '@/utils/is-phone-valid';

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Must Contain 8 Characters')
  .regex(/^(?=.*[a-z])/, 'Must Contain One Lowercase Character')
  .regex(/^(?=.*[A-Z])/, 'Must Contain One Uppercase Character')
  .regex(/^(?=.*\d)/, 'Must Contain One Number Character')
  .regex(/^(?=.*[!@#$%^&*])/, 'Must Contain  One Special Case Character');

const schema = z
  .object({
    firstName: z.string().min(1, 'This field is required'),
    lastName: z.string().min(1, 'This field is required'),
    email: z.string().min(1, 'This field is required').email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    mobile: z
      .string()
      .refine((value) => isPhoneValid(value), 'Please enter a valid number')
      .optional(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export default schema;
