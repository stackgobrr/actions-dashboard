const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

// Cache secrets during Lambda warm start
let cachedClientId = null
let cachedClientSecret = null

async function getOAuthSecrets() {
  if (cachedClientId && cachedClientSecret) {
    return { clientId: cachedClientId, clientSecret: cachedClientSecret }
  }

  const clientIdSecretName = process.env.ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME
  const clientSecretSecretName = process.env.ACTIONS_DASHBOARD_OAUTH_CLIENT_SECRET_SECRET_NAME

  if (!clientIdSecretName || !clientSecretSecretName) {
    throw new Error('OAuth secret names not configured')
  }

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION_NAME || 'eu-west-2' })

  const [clientIdResponse, clientSecretResponse] = await Promise.all([
    client.send(new GetSecretValueCommand({ SecretId: clientIdSecretName })),
    client.send(new GetSecretValueCommand({ SecretId: clientSecretSecretName }))
  ])

  cachedClientId = clientIdResponse.SecretString
  cachedClientSecret = clientSecretResponse.SecretString

  return { clientId: cachedClientId, clientSecret: cachedClientSecret }
}

function debug(...args) {
  if (process.env.ENVIRONMENT === 'dev') {
    console.log('[DEBUG]', ...args)
  }
}

exports.handler = async (event) => {
  try {
    debug('Incoming event:', JSON.stringify(event, null, 2))
    const code = event.queryStringParameters?.code
    const state = event.queryStringParameters?.state

    // Parse cookies from headers
    const cookies = {}
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie || ''
    cookieHeader.split(';').forEach(cookie => {
      const [key, value] = cookie.split('=')?.map(s => s && s.trim())
      if (key) cookies[key] = value
    })
    debug('Parsed cookies:', cookies)

    if (!code || !state || !cookies.oauth_state || cookies.oauth_state !== state) {
      console.error('Invalid OAuth callback (missing code or state mismatch)', { code, state, cookies })
      return {
        statusCode: 400,
        body: 'Invalid OAuth callback (missing code or state mismatch)'
      }
    }

    let clientId, clientSecret
    try {
      const secrets = await getOAuthSecrets()
      clientId = secrets.clientId
      clientSecret = secrets.clientSecret
      debug('Fetched OAuth secrets:', { clientId, clientSecret })
    } catch (err) {
      console.error('Failed to fetch OAuth secrets', err)
      return {
        statusCode: 500,
        body: 'OAuth not configured'
      }
    }

    const redirectUri = process.env.ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI
    debug('Using redirectUri for token exchange:', redirectUri)

    if (!clientId || !clientSecret) {
      console.error('Missing clientId or clientSecret')
      return {
        statusCode: 500,
        body: 'OAuth not configured'
      }
    }

    // Exchange code for access token
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    })
    debug('Token exchange params:', params.toString())

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    const tokenJson = await tokenRes.json()
    debug('Token exchange response:', tokenJson)

    if (tokenJson.error) {
      console.error('OAuth exchange failed:', tokenJson)
      return {
        statusCode: 500,
        body: `OAuth exchange failed: ${tokenJson.error_description || tokenJson.error}`
      }
    }

    const accessToken = tokenJson.access_token

    // Return HTML that sets localStorage and redirects
    // This allows JavaScript to access the token (same security as PAT/GitHub App)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': 'oauth_state=; HttpOnly; Path=/; Max-Age=0; Secure'
      },
      body: `<!DOCTYPE html>
<html>
<head><title>Redirecting...</title></head>
<body>
<script>
localStorage.setItem('github_token', '${accessToken}');
localStorage.setItem('auth_method', 'oauth');
window.location.href = '/';
</script>
</body>
</html>`
    }
  } catch (err) {
    console.error('OAuth callback error:', err)
    return {
      statusCode: 500,
      body: `OAuth callback error: ${err.message}`
    }
  }
}
