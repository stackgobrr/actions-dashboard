/**
 * SSE Streaming Lambda Handler
 * Streams workflow events to browser clients via Server-Sent Events
 * Filters events by installation_id for multi-tenant security
 */

import { eventBroadcaster } from './eventBroadcaster.js';

/**
 * Lambda handler with response streaming
 * Must be configured with Lambda Function URL and invoke mode RESPONSE_STREAM
 */
export const handler = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    console.log('[SSE] Client connected');

    // Extract installation_id from query parameters
    const installationId = event.queryStringParameters?.installation_id;

    if (!installationId) {
      console.error('[SSE] Missing installation_id parameter');
      responseStream.write(
        JSON.stringify({
          statusCode: 401,
          body: JSON.stringify({ error: 'Missing installation_id parameter' }),
        })
      );
      responseStream.end();
      return;
    }

    console.log('[SSE] Client installation_id:', installationId);

    // Set SSE headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Update with your domain in production
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Write headers
    const metadata = {
      statusCode: 200,
      headers,
    };
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    // Send initial connection message
    responseStream.write(`data: ${JSON.stringify({ type: 'connected', installationId })}\n\n`);

    // Subscribe to workflow events (filtered by installation_id)
    const unsubscribe = eventBroadcaster.subscribe((workflowEvent) => {
      // Security: Only send events matching this client's installation_id
      if (workflowEvent.installationId === installationId) {
        console.log(
          `[SSE] Sending event to installation ${installationId}:`,
          workflowEvent.type,
          workflowEvent.repository
        );

        try {
          responseStream.write(`data: ${JSON.stringify(workflowEvent)}\n\n`);
        } catch (error) {
          console.error('[SSE] Error writing to stream:', error);
          // Connection likely closed, unsubscribe will be called below
        }
      }
    });

    // Keep connection alive with periodic heartbeat
    const heartbeatInterval = setInterval(() => {
      try {
        responseStream.write(`: heartbeat\n\n`);
      } catch (error) {
        console.error('[SSE] Heartbeat failed, connection closed');
        clearInterval(heartbeatInterval);
      }
    }, 30000); // 30 seconds

    // Handle connection timeout (API Gateway limit: 30 minutes for Lambda Function URLs)
    const timeout = setTimeout(() => {
      console.log('[SSE] Connection timeout, closing stream');
      cleanup();
    }, 29 * 60 * 1000); // 29 minutes (just under API Gateway limit)

    // Cleanup function
    const cleanup = () => {
      console.log('[SSE] Cleaning up connection for installation', installationId);
      clearInterval(heartbeatInterval);
      clearTimeout(timeout);
      unsubscribe();
      try {
        responseStream.end();
      } catch (error) {
        // Stream already closed
      }
    };

    // Handle client disconnect
    context.callbackWaitsForEmptyEventLoop = false;

    // Keep Lambda alive until connection closes
    // The stream will remain open until client disconnects or timeout
    return new Promise((resolve) => {
      responseStream.on('close', () => {
        console.log('[SSE] Client disconnected');
        cleanup();
        resolve();
      });

      responseStream.on('error', (error) => {
        console.error('[SSE] Stream error:', error);
        cleanup();
        resolve();
      });
    });
  }
);
