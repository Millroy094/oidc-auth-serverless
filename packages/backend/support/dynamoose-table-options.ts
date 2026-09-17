import { TableOptionsOptional } from 'dynamoose/dist/Table';
import config from './env-config.ts';

// DynamoDB tables are provisioned by Terraform in every real AWS environment
// (local Ministack included), so the app should never attempt to create or
// wait for tables itself. In production the Lambda's IAM role intentionally
// only grants item-level permissions (no dynamodb:CreateTable), so leaving
// dynamoose's defaults (create: true, waitForActive: true) on would crash
// every request that touches a model - dynamoose treats any failure while
// checking the table (including an AccessDenied on DescribeTable) as "table
// missing" and tries to create it, which then also fails.
const isLocal = config.get('deploymentEnvironment') === 'local';

const tableOptions: TableOptionsOptional = {
  create: isLocal,
  waitForActive: isLocal,
};

export default tableOptions;
