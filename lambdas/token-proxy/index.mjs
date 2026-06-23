import { createAppAuth } from '@octokit/auth-app';
import { getSession } from './shared/auth.mjs';
import { query } from './shared/db.mjs';
import { getSecret } from './shared/secrets.mjs';
import { badRequest, internalError, noContent, ok, unauthorized } from './shared/response.mjs';

function preflight() {
  return noContent({
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
  });
}

/**
 * Mints a GitHub App installation token for the authenticated user.
 *
 * @param {Record<string, unknown>} event - Lambda Function URL event.
 * @returns {Promise<Record<string, unknown>>} API response.
 */
export async function handler(event) {
  const method = event?.requestContext?.http?.method;
  if (method === 'OPTIONS') {
    return preflight();
  }

  try {
    const session = await getSession(event);
    if (!session?.sub) {
      return unauthorized();
    }

    const { rows } = await query(
      `
        SELECT installation_id
        FROM users
        WHERE github_id = :github_id
      `,
      [{ name: 'github_id', value: Number(session.sub) }],
    );

    const installationId = rows[0]?.installation_id;
    if (!installationId) {
      return badRequest('No GitHub App installation is linked to this user');
    }

    const privateKeyArn = process.env.GITHUB_APP_PRIVATE_KEY_ARN;
    const appId = process.env.GITHUB_APP_ID;
    if (!privateKeyArn || !appId) {
      throw new Error('GitHub App environment variables are not configured');
    }

    const privateKey = (await getSecret(privateKeyArn)).replace(/\\n/g, '\n');
    const auth = createAppAuth({
      appId,
      privateKey,
    });

    const { token, expiresAt } = await auth({
      type: 'installation',
      installationId: Number(installationId),
    });

    return ok({ token, expiresAt });
  } catch (error) {
    console.error('Token proxy failed', error);
    return internalError();
  }
}
