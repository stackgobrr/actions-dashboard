function buildHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
    ...extra,
  };
}

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: buildHeaders(extraHeaders),
    body: body === '' ? '' : JSON.stringify(body),
  };
}

/**
 * Builds a 200 JSON response.
 *
 * @param {unknown} body - Response body.
 * @param {Record<string, string>} [extra={}] - Additional headers.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function ok(body, extra = {}) {
  return jsonResponse(200, body, extra);
}

/**
 * Builds a 201 JSON response.
 *
 * @param {unknown} body - Response body.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function created(body) {
  return jsonResponse(201, body);
}

/**
 * Builds a 204 response.
 *
 * @param {Record<string, string>} [extra={}] - Additional headers.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function noContent(extra = {}) {
  return jsonResponse(204, '', extra);
}

/**
 * Builds a 400 JSON response.
 *
 * @param {string} msg - Error message.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function badRequest(msg) {
  return jsonResponse(400, { error: msg });
}

/**
 * Builds a 401 JSON response.
 *
 * @param {string} [msg='Unauthorized'] - Error message.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function unauthorized(msg = 'Unauthorized') {
  return jsonResponse(401, { error: msg });
}

/**
 * Builds a 403 JSON response.
 *
 * @param {string} [msg='Forbidden'] - Error message.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function forbidden(msg = 'Forbidden') {
  return jsonResponse(403, { error: msg });
}

/**
 * Builds a 404 JSON response.
 *
 * @param {string} [msg='Not Found'] - Error message.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function notFound(msg = 'Not Found') {
  return jsonResponse(404, { error: msg });
}

/**
 * Builds a 500 JSON response.
 *
 * @param {string} [msg='Internal Server Error'] - Error message.
 * @returns {{statusCode:number,headers:Record<string,string>,body:string}}
 */
export function internalError(msg = 'Internal Server Error') {
  return jsonResponse(500, { error: msg });
}
