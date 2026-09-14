import { sendEmail } from './notification.ts';
import { SNSClient } from '@aws-sdk/client-sns';
import { sendSMS } from './notification'; // Make sure this import is correct
import nodemailer from 'nodemailer';
import logger from './logger.ts';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn((mailOptions, callback) => {
      callback(null, { response: 'Message sent' });
    }),
  }),
}));

jest.mock('@aws-sdk/client-sns', () => {
  const mockedSNSClient = {
    send: jest.fn(),
  };
  return {
    SNSClient: jest.fn(() => mockedSNSClient),
    PublishCommand: jest.fn(),
  };
});

jest.mock('./logger', () => ({
  error: jest.fn(),
}));

describe('sendEmail', () => {
  it('should send an email successfully', async () => {
    await expect(
      sendEmail('test@example.com', 'Test Subject', 'Test Message'),
    ).resolves.not.toThrow();
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
      {
        from: expect.any(String),
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test Message',
      },
      expect.any(Function),
    );
  });

  it('should log an error and throw when email fails', async () => {
    // Type assertion for TypeScript to recognize Jest methods
    const sendMailMock = nodemailer.createTransport().sendMail as jest.Mock;
    sendMailMock.mockImplementationOnce((_, callback) => {
      callback(new Error('Email error'), null);
    });

    await expect(
      sendEmail('test@example.com', 'Test Subject', 'Test Message'),
    ).rejects.toThrow('Unable to send Email');
    expect(logger.error).toHaveBeenCalledWith('Email error');
  });
});

describe('sendSMS', () => {
  const mockClient = new SNSClient({}); // Create an instance of the mocked client

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  it('should send SMS successfully', async () => {
    // Type assertion for TypeScript to recognize Jest methods
    (mockClient.send as jest.Mock).mockResolvedValueOnce({}); // Mock the send method to resolve

    await expect(sendSMS('+123456789', 'Test SMS')).resolves.not.toThrow();
    expect(mockClient.send).toHaveBeenCalled(); // Ensure send was called
  });

  it('should log an error and throw when SMS fails', async () => {
    (mockClient.send as jest.Mock).mockRejectedValueOnce(
      new Error('SMS error'),
    ); // Mock the send method to reject

    await expect(sendSMS('+123456789', 'Test SMS')).rejects.toThrow(
      'Unable to send SMS',
    );
    expect(logger.error).toHaveBeenCalledWith('SMS error'); // Ensure the error was logged
  });
});
