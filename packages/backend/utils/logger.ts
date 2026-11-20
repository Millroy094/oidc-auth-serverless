import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'oauth-server' });

export default logger;
