import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import serverless from 'serverless-http';
import app from './app.ts';
import logger from './utils/logger.ts';

let initialized = false;

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  logger.addContext(context);

  if (!initialized) {
    app.initialize();
    initialized = true;
  }

  return serverless(app.expressApp)(event, context);
};
