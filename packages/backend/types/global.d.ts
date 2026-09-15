import type Provider from 'oidc-provider';

declare global {
  namespace Express {
    interface Request {
      oidcProvider: Provider;
      user?: { userId: string; email: string };
    }
  }
}

export {};
