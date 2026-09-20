import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import serverless from 'serverless-http';
import app from './app.ts';

let initialized = false;

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  if (!initialized) {
    app.initialize();
    initialized = true;
  }

  return serverless(app.expressApp)(event, context);
};
