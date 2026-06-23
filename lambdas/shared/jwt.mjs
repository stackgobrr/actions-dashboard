import { SignJWT, jwtVerify } from 'jose';
import { getSecret } from './secrets.mjs';

const encoder = new TextEncoder();
let signingKeyPromise;

async function getSigningKey() {
  if (!process.env.JWT_SECRET_ARN) {
    throw new Error('JWT_SECRET_ARN is not configured');
  }

  signingKeyPromise ??= getSecret(process.env.JWT_SECRET_ARN).then((secret) => encoder.encode(secret));
  return signingKeyPromise;
}

/**
 * Signs a JWT using the configured shared secret.
 *
 * @param {Record<string, unknown>} payload - JWT payload.
 * @returns {Promise<string>} Signed JWT.
 */
export async function signJwt(payload) {
  const issuedAt = Math.floor(Date.now() / 1000);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + 60 * 60 * 24)
    .sign(await getSigningKey());
}

/**
 * Verifies a JWT using the configured shared secret.
 *
 * @param {string} token - JWT string.
 * @returns {Promise<Record<string, unknown>>} Decoded payload.
 */
export async function verifyJwt(token) {
  const { payload } = await jwtVerify(token, await getSigningKey(), {
    algorithms: ['HS256'],
  });

  return payload;
}
