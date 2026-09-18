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
  // `trust proxy` is enabled in app.ts so req.protocol/req.get('host') reflect
  // the client-facing scheme/host when there's no host-rewriting proxy in
  // front of the backend (e.g. Ministack locally). In production, CloudFront
  // overwrites the Host header before proxying to API Gateway, so the issuer
  // must come from ISSUER_URL instead - same reasoning as RP_ID for WebAuthn.
  const issuer =
    config.get('oidc.issuerUrl') || `${req.protocol}://${req.get('host')}`;
  const provider = new Provider(issuer, configuration);
  req.oidcProvider = provider;
  next();
};

export default addOIDCProvider;
