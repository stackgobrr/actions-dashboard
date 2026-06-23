import crypto from 'node:crypto';
import { getSecret } from './shared/secrets.mjs';

/**
 * Starts the GitHub OAuth flow.
 *
 * @param {Record<string, unknown>} event - Lambda Function URL event.
 * @returns {Promise<{statusCode:number,headers:Record<string,string>}>} Redirect response.
 */
export async function handler(event) {
  if (event?.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
        Vary: 'Origin',
      },
      body: '',
    };
  }

  try {
    const clientIdSecret = process.env.ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME;
    const redirectUri = process.env.ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI;

    if (!clientIdSecret || !redirectUri) {
      throw new Error('OAuth environment variables are not configured');
    }

    const clientId = (await getSecret(clientIdSecret)).trim();
    const state = crypto.randomUUID();
    const url = new URL('https://github.com/login/oauth/authorize');

    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'read:user,repo');
    url.searchParams.set('state', state);

    return {
      statusCode: 302,
      headers: {
        Location: url.toString(),
        'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/oauth; Max-Age=600`,
      },
    };
  } catch (error) {
    console.error('Failed to start OAuth flow', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
        'Access-Control-Allow-Credentials': 'true',
        Vary: 'Origin',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
