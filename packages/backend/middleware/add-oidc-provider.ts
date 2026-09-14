import { Request, Response, NextFunction } from 'express';
import Provider from 'oidc-provider';
import getConfiguration from '../support/get-configuration.ts';

const addOIDCProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const configuration = await getConfiguration();
  const provider = new Provider('https://localhost:3000', configuration);
  req.oidcProvider = provider;
  next();
};

export default addOIDCProvider;
