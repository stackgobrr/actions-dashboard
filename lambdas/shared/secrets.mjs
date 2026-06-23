import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({});
const secretCache = new Map();

/**
 * Fetches a secret value from AWS Secrets Manager and caches it for warm invocations.
 *
 * @param {string} secretArn - The secret ARN or name.
 * @returns {Promise<string>} The secret value.
 */
export async function getSecret(secretArn) {
  if (!secretArn) {
    throw new Error('Secret ARN is required');
  }

  if (secretCache.has(secretArn)) {
    return secretCache.get(secretArn);
  }

  const response = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));
  const secret =
    response.SecretString ??
    (response.SecretBinary ? Buffer.from(response.SecretBinary).toString('utf8') : null);

  if (secret == null) {
    throw new Error(`Secret ${secretArn} has no value`);
  }

  secretCache.set(secretArn, secret);
  return secret;
}
