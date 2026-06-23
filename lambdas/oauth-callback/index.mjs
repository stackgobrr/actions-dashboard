import { getSecret } from './shared/secrets.mjs';
import { query } from './shared/db.mjs';
import { signJwt } from './shared/jwt.mjs';
import { badRequest, internalError } from './shared/response.mjs';

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

      cookies[entry.slice(0, separatorIndex).trim()] = entry.slice(separatorIndex + 1).trim();
      return cookies;
    }, {});
}

/**
 * Completes the GitHub OAuth flow and creates a session cookie.
 *
 * @param {Record<string, unknown>} event - Lambda Function URL event.
 * @returns {Promise<Record<string, unknown>>} Redirect response.
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
    const params = event?.queryStringParameters ?? {};
    const code = params.code;
    const state = params.state;
    const cookies = parseCookies(event?.headers?.cookie ?? '');
    const stateCookie = cookies.oauth_state;

    if (!code || !state || !stateCookie || state !== stateCookie) {
      return badRequest('Invalid OAuth state or code');
    }

    const clientIdSecret = process.env.ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME;
    const clientSecretSecret = process.env.ACTIONS_DASHBOARD_OAUTH_CLIENT_SECRET_SECRET_NAME;
    const redirectUri = process.env.ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI;

    if (!clientIdSecret || !clientSecretSecret || !redirectUri) {
      throw new Error('OAuth environment variables are not configured');
    }

    const [clientId, clientSecret] = await Promise.all([
      getSecret(clientIdSecret).then((value) => value.trim()),
      getSecret(clientSecretSecret).then((value) => value.trim()),
    ]);

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'actions-dashboard',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        state,
      }),
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      console.error('GitHub token exchange failed', tokenPayload);
      return badRequest('GitHub OAuth exchange failed');
    }

    const githubAccessToken = tokenPayload.access_token;
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer ' + githubAccessToken,
        'User-Agent': 'actions-dashboard',
      },
    });
    const githubUser = await userResponse.json();

    if (!userResponse.ok || !githubUser.id || !githubUser.login) {
      console.error('GitHub user fetch failed', githubUser);
      return badRequest('Unable to load GitHub user');
    }

    const { rows } = await query(
      `
        INSERT INTO users (github_id, login, avatar_url, github_token, created_at, updated_at)
        VALUES (:github_id, :login, :avatar_url, :github_token, NOW(), NOW())
        ON CONFLICT (github_id) DO UPDATE SET
          login = EXCLUDED.login,
          avatar_url = EXCLUDED.avatar_url,
          github_token = EXCLUDED.github_token,
          updated_at = NOW()
        RETURNING *
      `,
      [
        { name: 'github_id', value: Number(githubUser.id) },
        { name: 'login', value: githubUser.login },
        { name: 'avatar_url', value: githubUser.avatar_url ?? null },
        { name: 'github_token', value: githubAccessToken },
      ],
    );

    const user = rows[0];
    const jwt = await signJwt({
      sub: String(user.github_id),
      login: user.login,
    });

    return {
      statusCode: 302,
      headers: {
        Location: '/',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
        'Access-Control-Allow-Credentials': 'true',
        Vary: 'Origin',
      },
      cookies: [
        'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/oauth; Max-Age=0',
        `session=${jwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
      ],
    };
  } catch (error) {
    console.error('OAuth callback failed', error);
    return internalError();
  }
}
