import { getSession } from './shared/auth.mjs';
import { query } from './shared/db.mjs';
import {
  badRequest,
  internalError,
  noContent,
  notFound,
  ok,
  unauthorized,
} from './shared/response.mjs';

function parseBody(event) {
  if (!event?.body) {
    return {};
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  return JSON.parse(rawBody);
}

function preflight() {
  return noContent({
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT',
  });
}

/**
 * Handles profile reads and updates for the current user.
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

    const githubId = Number(session.sub);

    if (method === 'GET') {
      const [{ rows: userRows }, { rows: groupRows }] = await Promise.all([
        query(
          `
            SELECT github_id, login, avatar_url, settings, selected_repos
            FROM users
            WHERE github_id = :github_id
          `,
          [{ name: 'github_id', value: githubId }],
        ),
        query(
          `
            SELECT g.id, g.name, gm.role
            FROM group_members gm
            JOIN groups g ON g.id = gm.group_id
            WHERE gm.github_id = :github_id
            ORDER BY g.id
          `,
          [{ name: 'github_id', value: githubId }],
        ),
      ]);

      const user = userRows[0];
      if (!user) {
        return notFound('User not found');
      }

      return ok({
        github_id: user.github_id,
        login: user.login,
        avatar_url: user.avatar_url,
        settings: user.settings ?? {},
        selected_repos: user.selected_repos ?? [],
        groups: groupRows.map((group) => ({
          id: group.id,
          name: group.name,
          role: group.role,
        })),
      });
    }

    if (method === 'PUT') {
      const body = parseBody(event);
      const hasSettings = Object.prototype.hasOwnProperty.call(body, 'settings');
      const hasSelectedRepos = Object.prototype.hasOwnProperty.call(body, 'selected_repos');

      if (!hasSettings && !hasSelectedRepos) {
        return badRequest('Request body must include settings and/or selected_repos');
      }

      if (hasSettings && (body.settings == null || Array.isArray(body.settings) || typeof body.settings !== 'object')) {
        return badRequest('settings must be an object');
      }

      if (hasSelectedRepos && !Array.isArray(body.selected_repos)) {
        return badRequest('selected_repos must be an array');
      }

      const { rows } = await query(
        `
          SELECT settings, selected_repos
          FROM users
          WHERE github_id = :github_id
        `,
        [{ name: 'github_id', value: githubId }],
      );
      const current = rows[0];

      if (!current) {
        return notFound('User not found');
      }

      const mergedSettings = hasSettings ? { ...(current.settings ?? {}), ...body.settings } : current.settings ?? {};
      const selectedRepos = hasSelectedRepos ? body.selected_repos : current.selected_repos ?? [];

      await query(
        `
          UPDATE users
          SET settings = CAST(:settings AS JSONB),
              selected_repos = CAST(:selected_repos AS JSONB),
              updated_at = NOW()
          WHERE github_id = :github_id
        `,
        [
          { name: 'settings', value: JSON.stringify(mergedSettings) },
          { name: 'selected_repos', value: JSON.stringify(selectedRepos) },
          { name: 'github_id', value: githubId },
        ],
      );

      return ok({
        github_id: githubId,
        settings: mergedSettings,
        selected_repos: selectedRepos,
      });
    }

    return badRequest('Unsupported method');
  } catch (error) {
    console.error('Profile handler failed', error);
    return internalError();
  }
}
