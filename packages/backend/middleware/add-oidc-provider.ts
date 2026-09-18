import { Request, Response, NextFunction } from 'express';
import Provider from 'oidc-provider';
import config from '../support/env-config.ts';
import getConfiguration from '../support/get-configuration.ts';

const addOIDCProvider = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const configuration = await getConfiguration();
  const issuerUrl = config.get('oidc.issuerUrl');

  // oidc-provider derives endpoint URLs and cookie scoping from the request's
  // Host/protocol, not just the configured issuer. CloudFront doesn't forward
  // the client-facing Host to the origin, and requests can also reach the API
  // Gateway domain directly, so without this the interaction cookie ends up
  // scoped to the wrong host and the discovery document advertises the raw
  // API Gateway URL instead of ISSUER_URL. Force the request to look like it
  // came from ISSUER_URL so both are consistent with where we redirect to.
  if (issuerUrl) {
    const { host, protocol } = new URL(issuerUrl);
    req.headers.host = host;
    req.headers['x-forwarded-proto'] = protocol.replace(':', '');
  }

  const issuer = issuerUrl || `${req.protocol}://${req.get('host')}`;
  const provider = new Provider(issuer, configuration);
  provider.proxy = true;
  req.oidcProvider = provider;
  next();
};

export default addOIDCProvider;
