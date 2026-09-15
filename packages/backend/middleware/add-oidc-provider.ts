import { Request, Response, NextFunction } from 'express';
import Provider from 'oidc-provider';
import getConfiguration from '../support/get-configuration.ts';

const addOIDCProvider = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const configuration = await getConfiguration();
  // Derive the issuer from the incoming request rather than hardcoding a
  // host, since the backend runs behind different origins per environment
  // (Ministack API Gateway locally, CloudFront/API Gateway in production).
  // `trust proxy` is enabled in app.ts so req.protocol/req.get('host')
  // correctly reflect the original client-facing scheme/host.
  const issuer = `${req.protocol}://${req.get('host')}`;
  const provider = new Provider(issuer, configuration);
  req.oidcProvider = provider;
  next();
};

export default addOIDCProvider;
