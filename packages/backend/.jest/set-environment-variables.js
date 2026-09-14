const dotenv = require('dotenv');

process.env.ENCRYPTION_SECRET_KEY = 'something-secret';
process.env.ENCRYPTION_SECRET_IV = 'something-more-secret';

dotenv.config();
