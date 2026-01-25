const { createAppAuth } = require('@octokit/auth-app')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

// Cache secrets during Lambda warm start
let cachedPrivateKey = null

async function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey

  const secretName = process.env.ACTIONS_DASHBOARD_PRIVATE_KEY_SECRET_NAME
  if (!secretName) {
    throw new Error('ACTIONS_DASHBOARD_PRIVATE_KEY_SECRET_NAME not configured')
  }

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION_NAME || 'eu-west-2' })
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }))
  cachedPrivateKey = response.SecretString
  return cachedPrivateKey
}

exports.handler = async (event) => {
  const installationId = event.queryStringParameters?.installation_id

  if (!installationId) {
    return {
      statusCode: 400,
      body: 'installation_id query param required'
    }
  }

  const appId = process.env.ACTIONS_DASHBOARD_APP_ID
  let privateKey
  try {
    privateKey = await getPrivateKey()
  } catch (err) {
    console.error('Failed to fetch private key', err)
    return {
      statusCode: 500,
      body: 'GitHub App not configured'
    }
  }

  if (!appId || !privateKey) {
    return {
      statusCode: 500,
      body: 'GitHub App not configured'
    }
  }

  try {
    const auth = createAppAuth({
      appId: parseInt(appId, 10),
      privateKey: privateKey
    })

    // Request an installation access token
    const installationAuth = await auth({ type: 'installation', installationId: parseInt(installationId, 10) })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: installationAuth.token, expiresAt: installationAuth.expiresAt })
    }
  } catch (err) {
    console.error('Failed to mint installation token', err)
    return {
      statusCode: 500,
      body: `Failed to mint installation token: ${err.message}`
    }
  }
}
