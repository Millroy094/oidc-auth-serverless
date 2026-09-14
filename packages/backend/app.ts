import express from 'express';
import dynamoose from 'dynamoose';
import Provider from 'oidc-provider';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/admin.ts';
import oidcRoutes from './routes/oidc.ts';
import userRoutes from './routes/user.ts';
import healthCheckRoutes from './routes/health-check.ts';
import addOIDCProvider from './middleware/add-oidc-provider.ts';
import errorHandler from './middleware/error-handler.ts';
import config from './support/env-config.ts';

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
  private readonly environment;
  private initialized = false;

  constructor() {
    this.expressApp = express();
    this.environment = config.get('env');
  }

  private setupDynamoDB(): void {
    const isDev = this.environment === 'development';
    
    if (isDev) {
      dynamoose.aws.ddb.local();
    } else {
      const ddb = new dynamoose.aws.ddb.DynamoDB({
        region: config.get('aws.region'),
        credentials: {
          accessKeyId: config.get('aws.accessKey'),
          secretAccessKey: config.get('aws.secretKey'),
        },
      });
      dynamoose.aws.ddb.set(ddb);
    }
  }

  private setupMiddleware(): void {
    const isDev = this.environment === 'development';
    
    // CORS configuration
    const corsOrigins = isDev 
      ? ['http://localhost:5173', 'http://localhost:3000']
      : (process.env.CORS_ORIGINS?.split(',') || ['*']);
    
    this.expressApp.use(cors({ origin: corsOrigins, credentials: true }));
    this.expressApp.use(cookieParser());
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(addOIDCProvider);
    
    // Trust proxy for Lambda/CloudFront
    if (!isDev) {
      this.expressApp.set('trust proxy', 1);
    }
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
    
    this.setupDynamoDB();
    this.setupMiddleware();
    this.setupRoutes();
    
    this.initialized = true;
  }

  public startLocalServer(port = 3000): void {
    this.expressApp.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}

const app = new Application();
export default app;
