import nodemailer from 'nodemailer';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import logger from './logger.ts';
import config from '../support/env-config.ts';

const transporter = nodemailer.createTransport({
  service: config.get('email.service'),
  auth: {
    user: config.get('email.address'),
    pass: config.get('email.password'),
  },
});

const client = new SNSClient({
  region: 'eu-west-2',
  credentials: {
    accessKeyId: config.get('aws.accessKey'),
    secretAccessKey: config.get('aws.secretKey'),
  },
});

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
) => {
  const mailOptions = {
    from: config.get('email.address'),
    to: email,
    subject,
    text: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error(error.message);
      throw new Error('Unable to send Email');
    }
  });
};
