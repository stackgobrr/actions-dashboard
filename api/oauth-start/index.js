const crypto = require('crypto')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

// Cache secrets during Lambda warm start
let cachedClientId = null

async function getClientId() {
  if (cachedClientId) return cachedClientId

  const secretName = process.env.ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME
  if (!secretName) {
    throw new Error('ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME not configured')
  }

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION_NAME || 'eu-west-2' })
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }))
  cachedClientId = response.SecretString
  return cachedClientId
}

function debug(...args) {
  if (process.env.ENVIRONMENT === 'dev') {
    console.log('[DEBUG]', ...args)
  }
}

exports.handler = async (event) => {
  debug('Incoming event:', JSON.stringify(event, null, 2))
  debug('Lambda environment:', JSON.stringify(process.env, null, 2))

  let clientId
  try {
    clientId = await getClientId()
    debug('Fetched OAuth client ID:', clientId)
  } catch (err) {
    console.error('Failed to fetch OAuth client ID', err)
    return {
      statusCode: 500,
      body: 'OAuth not configured'
    }
  }

  const redirectUri = process.env.ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI
  debug('Using redirectUri:', redirectUri)

  if (!clientId || !redirectUri) {
    console.error('Missing clientId or redirectUri')
    return {
      statusCode: 500,
      body: 'OAuth not configured'
    }
  }

  const state = crypto.randomBytes(16).toString('hex')

  const scope = encodeURIComponent('read:user repo')
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`
  debug('OAuth authorize URL:', url)

  return {
    statusCode: 302,
    headers: {
      'Location': url,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`
    },
    body: ''
  }
}
