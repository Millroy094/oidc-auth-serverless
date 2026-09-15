import fs from 'fs';
import path from 'path';
import jose from 'node-jose';
import logger from '../utils/logger.ts';

const keyStore = jose.JWK.createKeyStore();

const keysPath = path.join(process.cwd(), 'keys.json');

keyStore
  .generate('RSA', 2048, { alg: 'RS256', use: 'sig' })
  .then(() => {
    fs.writeFileSync(keysPath, JSON.stringify(keyStore.toJSON(true), null, 2));
    logger.info(`✅ JWKS generated at ${keysPath}`);
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`❌ Failed to generate JWKS: ${(error as Error).message}`);
    process.exit(1);
  });
