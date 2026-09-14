import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

/**
 * Fetches all parameters under `prefix` from SSM Parameter Store and injects
 * them into `process.env`, keyed by the parameter's leaf name (e.g.
 * "/oidc-auth/local/ACCESS_JWT_SECRET" -> process.env.ACCESS_JWT_SECRET).
 *
 * Must run before `env-config.ts` builds its convict schema, since some
 * modules (e.g. utils/encryption.ts) read config values at import time.
 */
export const loadSsmParameters = async (prefix: string): Promise<void> => {
  // Region and credentials are resolved automatically by the AWS SDK from
  // standard env vars (AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
  // or the Lambda's IAM role on real AWS - no need to wire them up manually.
  const client = new SSMClient({});

  let nextToken: string | undefined;

  do {
    const response = await client.send(
      new GetParametersByPathCommand({
        Path: prefix,
        WithDecryption: true,
        NextToken: nextToken,
      }),
    );

    for (const parameter of response.Parameters ?? []) {
      const name = parameter.Name?.split('/').pop();
      if (name && parameter.Value !== undefined) {
        process.env[name] = parameter.Value;
      }
    }

    nextToken = response.NextToken;
  } while (nextToken);
};
