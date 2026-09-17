import { z } from 'zod';

const SCOPE_REGEX = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*)*$/;

const schema = z.object({
  id: z
    .string()
    .min(1, 'This field is required')
    .url('Must be a valid URL')
    .refine((value) => value.startsWith('https://'), 'Must use https'),
  name: z.string().min(1, 'This field is required'),
  scopes: z
    .array(
      z.object({
        id: z.string().min(1, 'scope id is required'),
        value: z
          .string()
          .min(1, 'scope is required')
          .regex(
            SCOPE_REGEX,
            'Use lowercase resource:action format, e.g. orders:read',
          ),
      }),
    )
    .min(1, 'atleast one scope should be present'),
});

export default schema;
