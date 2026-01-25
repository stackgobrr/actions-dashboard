/**
 * GitHub Webhook Receiver Lambda
 * Receives workflow_run and workflow_job events from GitHub
 * Validates webhook signature and broadcasts events to SSE clients
 */

import crypto from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { eventBroadcaster } from './eventBroadcaster.js';

// Cache webhook secret during Lambda warm start
let cachedWebhookSecret = null;

/**
 * Fetch webhook secret from AWS Secrets Manager
 * @returns {Promise<string>} Webhook secret
 */
async function getWebhookSecret() {
  if (cachedWebhookSecret) return cachedWebhookSecret;

  const secretName = process.env.ACTIONS_DASHBOARD_WEBHOOK_SECRET_NAME;
  if (!secretName) {
    throw new Error('ACTIONS_DASHBOARD_WEBHOOK_SECRET_NAME not configured');
  }

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION_NAME || 'eu-west-2' });
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
  cachedWebhookSecret = response.SecretString;
  return cachedWebhookSecret;
}

/**
 * Verify GitHub webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Hub-Signature-256 header value
 * @param {string} secret - Webhook secret
 * @returns {boolean} True if signature is valid
 */
function verifySignature(payload, signature, secret) {
  if (!signature) {
    console.error('[Webhook] Missing X-Hub-Signature-256 header');
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );

  if (!isValid) {
    console.error('[Webhook] Invalid signature');
  }

  return isValid;
}

/**
 * Parse workflow_run event
 * @param {Object} payload - GitHub webhook payload
 * @returns {Object} Normalized event data
 */
function parseWorkflowRunEvent(payload) {
  const { workflow_run, repository, action, installation } = payload;

  return {
    type: 'workflow_run',
    action,
    installationId: installation.id.toString(), // Critical for multi-tenant security
    repository: repository.name,
    repositoryFullName: repository.full_name,
    owner: repository.owner.login,
    workflow: workflow_run.name,
    workflowId: workflow_run.id,
    status: workflow_run.status,
    conclusion: workflow_run.conclusion,
    branch: workflow_run.head_branch,
    commitMessage: workflow_run.head_commit?.message || '',
    commitSha: workflow_run.head_sha,
    url: workflow_run.html_url,
    runNumber: workflow_run.run_number,
    timestamp: workflow_run.updated_at,
  };
}

/**
 * Parse workflow_job event
 * @param {Object} payload - GitHub webhook payload
 * @returns {Object} Normalized event data
 */
function parseWorkflowJobEvent(payload) {
  const { workflow_job, repository, action, installation } = payload;

  return {
    type: 'workflow_job',
    action,
    installationId: installation.id.toString(),
    repository: repository.name,
    repositoryFullName: repository.full_name,
    owner: repository.owner.login,
    workflow: workflow_job.workflow_name,
    jobName: workflow_job.name,
    jobId: workflow_job.id,
    status: workflow_job.status,
    conclusion: workflow_job.conclusion,
    url: workflow_job.html_url,
    timestamp: workflow_job.completed_at || workflow_job.started_at,
  };
}

/**
 * Parse pull_request event
 * @param {Object} payload - GitHub webhook payload
 * @returns {Object} Normalized event data
 */
function parsePullRequestEvent(payload) {
  const { pull_request, repository, action, installation } = payload;

  return {
    type: 'pull_request',
    action,
    installationId: installation.id.toString(),
    repository: repository.name,
    repositoryFullName: repository.full_name,
    owner: repository.owner.login,
    prNumber: pull_request.number,
    prTitle: pull_request.title,
    prState: pull_request.state,
    prDraft: pull_request.draft,
    prMerged: pull_request.merged || false,
    branch: pull_request.head.ref,
    baseBranch: pull_request.base.ref,
    url: pull_request.html_url,
    timestamp: pull_request.updated_at,
  };
}

/**
 * Lambda handler
 * @param {Object} event - API Gateway event
 * @returns {Object} Response
 */
export const handler = async (event) => {
  console.log('[Webhook] Received event');

  // Fetch webhook secret from Secrets Manager
  let secret;
  try {
    secret = await getWebhookSecret();
  } catch (error) {
    console.error('[Webhook] Failed to fetch webhook secret:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret not configured' }),
    };
  }

  // Verify webhook signature
  const signature = event.headers['x-hub-signature-256'] || event.headers['X-Hub-Signature-256'];
  const body = event.body;

  if (!verifySignature(body, signature, secret)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' }),
    };
  }

  // Parse webhook payload
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    console.error('[Webhook] Invalid JSON:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON payload' }),
    };
  }

  // Get event type from X-GitHub-Event header
  const githubEvent = event.headers['x-github-event'] || event.headers['X-GitHub-Event'];
  console.log('[Webhook] Event type:', githubEvent);

  // Process supported events
  let eventData;
  switch (githubEvent) {
    case 'workflow_run':
      eventData = parseWorkflowRunEvent(payload);
      console.log('[Webhook] Parsed workflow_run:', JSON.stringify(eventData));
      break;

    case 'workflow_job':
      eventData = parseWorkflowJobEvent(payload);
      console.log('[Webhook] Parsed workflow_job:', JSON.stringify(eventData));
      break;

    case 'pull_request':
      eventData = parsePullRequestEvent(payload);
      console.log('[Webhook] Parsed pull_request:', JSON.stringify(eventData));
      break;

    case 'ping':
      console.log('[Webhook] Ping event received');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'pong' }),
      };

    default:
      console.log('[Webhook] Unsupported event type:', githubEvent);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Event type not supported' }),
      };
  }

  // Broadcast event to SSE clients
  try {
    eventBroadcaster.broadcast(eventData);
    console.log('[Webhook] Event broadcast successful, active connections:',
      eventBroadcaster.getSubscriberCount());
  } catch (error) {
    console.error('[Webhook] Failed to broadcast event:', error);
    // Still return 200 to GitHub to avoid retries
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Webhook received',
      event: githubEvent,
      repository: eventData.repository,
    }),
  };
};
