import { verifyJwt } from './jwt.mjs';

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separatorIndex = entry.indexOf('=');
      if (separatorIndex === -1) {
        return cookies;
      }

      const name = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      cookies[name] = value;
      return cookies;
    }, {});
}

/**
 * Reads and verifies the session cookie from a Lambda Function URL event.
 *
 * @param {Record<string, unknown>} event - Lambda event.
 * @returns {Promise<Record<string, unknown> | null>} Session payload or null.
 */
export async function getSession(event) {
  try {
    const cookieHeader = event?.headers?.cookie ?? event?.headers?.Cookie ?? '';
    const cookies = parseCookies(cookieHeader);
    const token = cookies.session;

    if (!token) {
      return null;
    }

    return await verifyJwt(token);
  } catch {
    return null;
  }
}
