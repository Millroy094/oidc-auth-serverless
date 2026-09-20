import { jwtVerify, decodeJwt, SignJWT, errors } from 'jose';

export interface JwtPayload {
  userId: string;
  email: string;
  roles?: string[];
}

const encodeSecret = (secret: string) => new TextEncoder().encode(secret);

export const signJwt = async (
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): Promise<string> =>
  new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodeSecret(secret));

export const verifyJwt = async (
  token: string,
  secret: string,
): Promise<JwtPayload> => {
  const { payload } = await jwtVerify(token, encodeSecret(secret));
  return payload as unknown as JwtPayload;
};

export const isJwtExpiredError = (error: unknown): boolean =>
  error instanceof errors.JWTExpired;

export const getJwtExpiryMs = (token: string): number => {
  const { exp } = decodeJwt(token);
  return (exp ?? 0) * 1000 - Date.now();
};
