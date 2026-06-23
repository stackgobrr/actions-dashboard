import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getSession } from './shared/auth.mjs';
import { query } from './shared/db.mjs';

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const STREAM_TIMEOUT_MS = 55000;
const POLL_INTERVAL_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 25000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function baseHeaders(contentType) {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

function createStream(responseStream, statusCode, headers) {
  return awslambda.HttpResponseStream.from(responseStream, {
    statusCode,
    headers,
  });
}

async function writeJsonResponse(responseStream, statusCode, body) {
  const stream = createStream(responseStream, statusCode, baseHeaders('application/json'));
  stream.write(JSON.stringify(body));
  stream.end();
}

async function loadInstallationIds(githubId) {
  const { rows } = await query(
    `
      SELECT DISTINCT installation_id
      FROM users
      WHERE installation_id IS NOT NULL
        AND (
          github_id = :github_id
          OR github_id IN (
            SELECT gm2.github_id
            FROM group_members gm1
            JOIN group_members gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.github_id = :github_id
          )
        )
    `,
    [{ name: 'github_id', value: githubId }],
  );

  return rows.map((row) => row.installation_id?.toString()).filter(Boolean);
}

async function loadEvents(installationIds, since) {
  const tableName = process.env.DYNAMODB_EVENTS_TABLE;
  if (!tableName) {
    throw new Error('DYNAMODB_EVENTS_TABLE is not configured');
  }

  const queryResults = await Promise.all(
    installationIds.map(async (installationId) => {
      const response = await documentClient.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: 'installation_id = :installation_id',
          FilterExpression: 'received_at > :since',
          ExpressionAttributeValues: {
            ':installation_id': installationId,
            ':since': since,
          },
        }),
      );

      return response.Items ?? [];
    }),
  );

  return queryResults
    .flat()
    .sort((a, b) => (a.received_at ?? 0) - (b.received_at ?? 0));
}

/**
 * Streams webhook events to the authenticated client using SSE.
 *
 * @param {Record<string, unknown>} event - Lambda Function URL event.
 * @param {import('stream').Writable} responseStream - Lambda response stream.
 * @returns {Promise<void>}
 */
export const handler = awslambda.streamifyResponse(async (event, responseStream) => {
  const method = event?.requestContext?.http?.method;
  let stream;

  if (method === 'OPTIONS') {
    stream = createStream(
      responseStream,
      204,
      {
        ...baseHeaders('application/json'),
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
    );
    stream.end();
    return;
  }

  try {
    const session = await getSession(event);
    if (!session?.sub) {
      await writeJsonResponse(responseStream, 401, { error: 'Unauthorized' });
      return;
    }

    const installationIds = await loadInstallationIds(Number(session.sub));
    stream = createStream(responseStream, 200, {
      ...baseHeaders('text/event-stream'),
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    let lastEventTime = Number(event?.queryStringParameters?.since);
    if (!Number.isFinite(lastEventTime) || lastEventTime <= 0) {
      lastEventTime = Date.now();
    }

    const deadline = Date.now() + STREAM_TIMEOUT_MS;
    let nextHeartbeatAt = Date.now() + HEARTBEAT_INTERVAL_MS;
    const emittedIds = new Set();

    stream.write(': connected\n\n');

    while (Date.now() < deadline) {
      if (installationIds.length > 0) {
        const events = await loadEvents(installationIds, lastEventTime);

        for (const item of events) {
          if (emittedIds.has(item.event_id)) {
            continue;
          }

          emittedIds.add(item.event_id);
          lastEventTime = Math.max(lastEventTime, item.received_at ?? lastEventTime);

          let payload = item.payload;
          if (typeof payload === 'string') {
            try {
              payload = JSON.parse(payload);
            } catch {
              payload = { raw: payload };
            }
          }

          stream.write(
            `data: ${JSON.stringify({
              event_type: item.event_type,
              repo: item.repo_full_name,
              action: item.action,
              received_at: item.received_at,
              payload,
            })}\n\n`,
          );
        }
      }

      if (Date.now() >= nextHeartbeatAt) {
        stream.write(': heartbeat\n\n');
        nextHeartbeatAt = Date.now() + HEARTBEAT_INTERVAL_MS;
      }

      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        break;
      }

      await sleep(Math.min(POLL_INTERVAL_MS, remaining));
    }

    stream.end();
  } catch (error) {
    console.error('Event stream failed', error);
    if (stream) {
      stream.write('event: error\ndata: {"error":"Internal Server Error"}\n\n');
      stream.end();
      return;
    }

    await writeJsonResponse(responseStream, 500, { error: 'Internal Server Error' });
  }
});
