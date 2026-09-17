import { z } from 'zod';
import isPhoneValid from '@/utils/is-phone-valid';

const schema = z.object({
  firstName: z.string().min(1, 'This field is required'),
  lastName: z.string().min(1, 'This field is required'),
  email: z.string().min(1, 'This field is required').email(),
  emailVerified: z.boolean(),
  mobile: z
    .string()
    .refine((value) => isPhoneValid(value), 'Please enter a valid number')
    .optional(),
  roles: z.array(z.string()),
  suspended: z.boolean(),
  resources: z.array(
    z.object({
      id: z.string().min(1, 'resource is required'),
      scopes: z.array(z.string()).min(1, 'atleast one scope is required'),
    }),
  ),
});

export default schema;
