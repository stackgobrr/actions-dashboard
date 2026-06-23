import { getSession } from './shared/auth.mjs';
import { query } from './shared/db.mjs';
import {
  badRequest,
  created,
  forbidden,
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

function getRouteParts(rawPath = '') {
  let normalizedPath = rawPath;
  while (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  return normalizedPath.split('/').filter(Boolean);
}

function preflight() {
  return noContent({
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  });
}

async function getMembership(groupId, githubId) {
  const { rows } = await query(
    `
      SELECT gm.role, g.id, g.name, g.created_by, g.created_at
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.group_id = :group_id AND gm.github_id = :github_id
    `,
    [
      { name: 'group_id', value: groupId },
      { name: 'github_id', value: githubId },
    ],
  );

  return rows[0] ?? null;
}

/**
 * Handles group CRUD endpoints.
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
    const parts = getRouteParts(event?.rawPath ?? '');
    const groupId = parts[2] ? Number(parts[2]) : null;

    if (method === 'POST' && parts.length === 2) {
      const body = parseBody(event);
      if (!body.name || typeof body.name !== 'string') {
        return badRequest('name is required');
      }

      const { rows } = await query(
        `
          INSERT INTO groups (name, created_by, created_at)
          VALUES (:name, :created_by, NOW())
          RETURNING id, name, created_by, created_at
        `,
        [
          { name: 'name', value: body.name.trim() },
          { name: 'created_by', value: githubId },
        ],
      );

      const group = rows[0];

      await query(
        `
          INSERT INTO group_members (group_id, github_id, role, joined_at)
          VALUES (:group_id, :github_id, :role, NOW())
          ON CONFLICT (group_id, github_id) DO UPDATE SET role = EXCLUDED.role
        `,
        [
          { name: 'group_id', value: group.id },
          { name: 'github_id', value: githubId },
          { name: 'role', value: 'owner' },
        ],
      );

      return created({ ...group, role: 'owner' });
    }

    if (method === 'GET' && parts.length === 2) {
      const { rows } = await query(
        `
          SELECT g.id, g.name, g.created_by, g.created_at, gm.role
          FROM groups g
          JOIN group_members gm ON gm.group_id = g.id
          WHERE gm.github_id = :github_id
          ORDER BY g.id
        `,
        [{ name: 'github_id', value: githubId }],
      );

      return ok(rows);
    }

    if (!groupId || Number.isNaN(groupId)) {
      return notFound('Group not found');
    }

    const membership = await getMembership(groupId, githubId);
    if (!membership) {
      return forbidden('You are not a member of this group');
    }

    if (method === 'GET' && parts.length === 3) {
      const { rows: memberRows } = await query(
        `
          SELECT u.github_id, u.login, gm.role
          FROM group_members gm
          JOIN users u ON u.github_id = gm.github_id
          WHERE gm.group_id = :group_id
          ORDER BY u.login
        `,
        [{ name: 'group_id', value: groupId }],
      );

      return ok({
        id: membership.id,
        name: membership.name,
        created_by: membership.created_by,
        created_at: membership.created_at,
        members: memberRows,
      });
    }

    if (method === 'POST' && parts[3] === 'members' && parts.length === 4) {
      if (membership.role !== 'owner') {
        return forbidden('Only owners can add members');
      }

      const body = parseBody(event);
      const role = body.role ?? 'member';
      if (!body.login || typeof body.login !== 'string') {
        return badRequest('login is required');
      }
      if (!['member', 'owner'].includes(role)) {
        return badRequest('role must be member or owner');
      }

      const { rows: userRows } = await query(
        `
          SELECT github_id, login
          FROM users
          WHERE LOWER(login) = LOWER(:login)
        `,
        [{ name: 'login', value: body.login }],
      );
      const user = userRows[0];

      if (!user) {
        return notFound('GitHub user not found');
      }

      await query(
        `
          INSERT INTO group_members (group_id, github_id, role, joined_at)
          VALUES (:group_id, :github_id, :role, NOW())
          ON CONFLICT (group_id, github_id) DO UPDATE SET role = EXCLUDED.role
        `,
        [
          { name: 'group_id', value: groupId },
          { name: 'github_id', value: Number(user.github_id) },
          { name: 'role', value: role },
        ],
      );

      return created({
        group_id: groupId,
        github_id: user.github_id,
        login: user.login,
        role,
      });
    }

    if (method === 'DELETE' && parts[3] === 'members' && parts[4]) {
      const targetGithubId = Number(parts[4]);
      if (Number.isNaN(targetGithubId)) {
        return badRequest('Invalid github_id');
      }

      const isSelf = targetGithubId === githubId;
      if (!isSelf && membership.role !== 'owner') {
        return forbidden('Only owners can remove other members');
      }

      await query(
        `
          DELETE FROM group_members
          WHERE group_id = :group_id AND github_id = :github_id
        `,
        [
          { name: 'group_id', value: groupId },
          { name: 'github_id', value: targetGithubId },
        ],
      );

      return noContent();
    }

    if (parts[3] === 'config' && parts.length === 4) {
      if (method === 'GET') {
        const { rows } = await query(
          `
            SELECT config
            FROM group_configs
            WHERE group_id = :group_id
          `,
          [{ name: 'group_id', value: groupId }],
        );

        return ok({ config: rows[0]?.config ?? {} });
      }

      if (method === 'PUT') {
        const body = parseBody(event);
        const config = body?.config && typeof body.config === 'object' && !Array.isArray(body.config) ? body.config : body;

        if (config == null || Array.isArray(config) || typeof config !== 'object') {
          return badRequest('config must be an object');
        }

        await query(
          `
            INSERT INTO group_configs (group_id, config, updated_at)
            VALUES (:group_id, CAST(:config AS JSONB), NOW())
            ON CONFLICT (group_id) DO UPDATE
            SET config = EXCLUDED.config, updated_at = NOW()
          `,
          [
            { name: 'group_id', value: groupId },
            { name: 'config', value: JSON.stringify(config) },
          ],
        );

        return ok({ config });
      }
    }

    return notFound('Route not found');
  } catch (error) {
    console.error('Groups handler failed', error);
    return internalError();
  }
}
