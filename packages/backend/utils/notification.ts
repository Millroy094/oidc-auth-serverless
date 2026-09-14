import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import logger from './logger.ts';
import config from '../support/env-config.ts';

// Region and credentials are resolved automatically by the AWS SDK from the
// standard AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars
// (set explicitly for Ministack, or provided by the Lambda's IAM role on
// real AWS) - no need to wire them up manually.
const client = new SNSClient({});

const sesClient = new SESClient({});

export const sendSMS = async (
  number: string,
  message: string,
): Promise<void> => {
  try {
    const params = {
      Message: message,
      PhoneNumber: number,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    };
    await client.send(new PublishCommand(params));
  } catch (err) {
    logger.error((err as Error).message);
    throw new Error('Unable to send SMS');
  }
};

export const sendEmail = async (
  email: string,
  subject: string,
  message: string,
): Promise<void> => {
  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: config.get('email.fromAddress'),
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: { Data: subject },
          Body: {
            Text: { Data: message },
          },
        },
      }),
    );
  } catch (err) {
    logger.error((err as Error).message);
    throw new Error('Unable to send Email');
  }
};

