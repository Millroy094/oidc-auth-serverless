import { z } from 'zod';

const isLocalhost = (hostname: string): boolean =>
  ['localhost', '127.0.0.1'].includes(hostname);

const schema = z.object({
  clientId: z.string().min(1, 'This field is required'),
  clientName: z.string().min(1, 'This field is required'),
  grants: z.array(z.string()).min(1, 'This field is required'),
  scopes: z.array(z.string()).min(1, 'This field is required'),
  redirectUris: z
    .array(
      z.object({
        id: z.string().min(1, 'redirect uri id is required'),
        value: z
          .string()
          .min(1, 'url is required')
          .url('url is invalid')
          .refine((value) => {
            try {
              const url = new URL(value);
              return url.protocol === 'https:' || isLocalhost(url.hostname);
            } catch {
              return false;
            }
          }, 'Must use https (http is only allowed for localhost)'),
      }),
    )
    .min(1, 'atleast one url should be present'),
  resources: z.array(
    z.object({
      id: z.string().min(1, 'resource is required'),
      scopes: z.array(z.string()).min(1, 'atleast one scope is required'),
    }),
  ),
  requirePkce: z.boolean(),
});

export default schema;
