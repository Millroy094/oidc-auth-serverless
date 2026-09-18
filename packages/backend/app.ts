import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import Provider from 'oidc-provider';
import addOIDCProvider from './middleware/add-oidc-provider.ts';
import errorHandler from './middleware/error-handler.ts';
import verifyOrigin from './middleware/verify-origin.ts';
import adminRoutes from './routes/admin.ts';
import healthCheckRoutes from './routes/health-check.ts';
import oidcRoutes from './routes/oidc.ts';
import userRoutes from './routes/user.ts';

declare global {
  namespace Express {
    interface Request {
      oidcProvider: Provider;
      user?: { userId: string; email: string };
    }
  }
}

class Application {
  public readonly expressApp;
  private initialized = false;

  constructor() {
    this.expressApp = express();
  }

  private setupMiddleware(): void {
    // CORS is handled entirely by API Gateway's native cors_configuration
    // (see infra/modules/api_gateway) - setting it here too would cause
    // duplicate Access-Control-Allow-* headers, which browsers reject.
    this.expressApp.use(cookieParser());
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(addOIDCProvider);

    // Disable ETag/conditional-GET: a repeat GET for the same resource (e.g.
    // re-opening the same client/user record) would otherwise get a 304 with
    // an empty body instead of the JSON payload.
    this.expressApp.set('etag', false);
    this.expressApp.use((_req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    });

    this.expressApp.set('trust proxy', 1);
  }

  private setupRoutes(): void {
    this.expressApp.use('/api/health-check', healthCheckRoutes);
    this.expressApp.use('/api/oidc', oidcRoutes);
    this.expressApp.use('/api/user', verifyOrigin, userRoutes);
    this.expressApp.use('/api/admin', verifyOrigin, adminRoutes);
    this.expressApp.use(errorHandler);
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    this.setupMiddleware();
    this.setupRoutes();

    this.initialized = true;
  }
}

const app = new Application();
export default app;
