import express from 'express';
import Provider from 'oidc-provider';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/admin.ts';
import oidcRoutes from './routes/oidc.ts';
import userRoutes from './routes/user.ts';
import healthCheckRoutes from './routes/health-check.ts';
import addOIDCProvider from './middleware/add-oidc-provider.ts';
import errorHandler from './middleware/error-handler.ts';

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
    // (see infra/modules/api_gateway). Also setting CORS headers here would
    // cause duplicate Access-Control-Allow-* headers, which browsers reject.
    this.expressApp.use(cookieParser());
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(addOIDCProvider);

    // This is a dynamic API, not static content - disable Express's default
    // ETag/conditional-GET behaviour. Otherwise a repeat GET to the same
    // resource (e.g. re-opening the same client/user record) sends back
    // `If-None-Match`, and if it matches Express replies `304 Not Modified`
    // with an EMPTY body instead of the JSON payload, which broke the
    // frontend when the same record was fetched more than once.
    this.expressApp.set('etag', false);
    this.expressApp.use((req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    });

    // Trust proxy for Lambda/CloudFront
    this.expressApp.set('trust proxy', 1);
  }

  private setupRoutes(): void {
    this.expressApp.use('/api/oidc', oidcRoutes);
    this.expressApp.use('/api/user', userRoutes);
    this.expressApp.use('/api/admin', adminRoutes);
    this.expressApp.use('/api/health-check', healthCheckRoutes);
    this.expressApp.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.setupMiddleware();
    this.setupRoutes();
    
    this.initialized = true;
  }
}

const app = new Application();
export default app;
