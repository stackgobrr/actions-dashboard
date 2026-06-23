import crypto from 'node:crypto';
import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getSecret } from './shared/secrets.mjs';
import { internalError, noContent, unauthorized } from './shared/response.mjs';

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function getHeader(headers = {}, name) {
  return headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
}

function getRawBody(event) {
  if (!event?.body) {
    return Buffer.from('');
  }

  return event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body, 'utf8');
}

function preflight() {
  return noContent({
    'Access-Control-Allow-Headers': 'Content-Type,X-Hub-Signature-256,X-GitHub-Delivery,X-GitHub-Event',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
  });
}

/**
 * Receives GitHub webhooks, verifies them, and stores them in DynamoDB.
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
    const signatureHeader = getHeader(event?.headers, 'x-hub-signature-256');
    const deliveryId = getHeader(event?.headers, 'x-github-delivery');
    const eventType = getHeader(event?.headers, 'x-github-event');

    if (!signatureHeader || !deliveryId || !eventType) {
      return unauthorized('Missing GitHub signature headers');
    }

    const secretArn = process.env.GITHUB_WEBHOOK_SECRET_ARN;
    const tableName = process.env.DYNAMODB_EVENTS_TABLE;
    if (!secretArn || !tableName) {
      throw new Error('Webhook environment variables are not configured');
    }

    const secret = await getSecret(secretArn);
    const rawBody = getRawBody(event);
    const expectedSignature = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;

    const signatureBuffer = Buffer.from(signatureHeader);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return unauthorized('Invalid webhook signature');
    }

    const body = JSON.parse(rawBody.toString('utf8') || '{}');
    const now = Date.now();
    const item = {
      installation_id: body.installation?.id?.toString() || 'global',
      event_id: deliveryId,
      delivery_id: deliveryId,
      event_type: eventType,
      action: body.action || null,
      repo_full_name: body.repository?.full_name || null,
      payload: JSON.stringify(body),
      received_at: now,
      ttl: Math.floor(now / 1000) + 172800,
    };

    try {
      await documentClient.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
          ConditionExpression: 'attribute_not_exists(event_id)',
        }),
      );
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException || error?.name === 'ConditionalCheckFailedException') {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
            'Access-Control-Allow-Credentials': 'true',
            Vary: 'Origin',
          },
          body: JSON.stringify({ ok: true }),
        };
      }

      throw error;
    }

    return noContent();
  } catch (error) {
    console.error('Webhook receiver failed', error);
    return internalError();
  }
}
