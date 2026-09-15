import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          const safeTimestamp =
            typeof timestamp === 'string' ? timestamp : String(timestamp);
          const safeMessage =
            typeof message === 'string' ? message : JSON.stringify(message);
          if (stack) {
            const safeStack =
              typeof stack === 'string' ? stack : JSON.stringify(stack);
            return `${safeTimestamp} [${level.toLocaleUpperCase()}]: ${safeMessage} - ${safeStack}`;
          }
          return `${safeTimestamp} [${level.toUpperCase()}]: ${safeMessage}`;
        }),
        winston.format.colorize({ all: true }),
      ),
    }),
  ],
});

export default logger;
