import { z } from 'zod';

const schema = z.object({
  clientId: z.string().min(1, 'This field is required'),
  clientName: z.string().min(1, 'This field is required'),
  grants: z.array(z.string()).min(1, 'This field is required'),
  scopes: z.array(z.string()).min(1, 'This field is required'),
  redirectUris: z
    .array(
      z.object({
        id: z.string().min(1, 'redirect uri id is required'),
        value: z.string().min(1, 'url is required').url('url is invalid'),
      }),
    )
    .min(1, 'atleast one url should be present'),
});

export default schema;
