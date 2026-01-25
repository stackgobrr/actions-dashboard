/**
 * Event Broadcaster - In-memory pub/sub for GitHub webhook events
 * Broadcasts workflow events to all connected SSE clients
 */

import { EventEmitter } from 'events';

class EventBroadcaster extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Support up to 100 concurrent SSE connections
  }

  /**
   * Broadcast a workflow event to all connected clients
   * @param {Object} event - Workflow event data
   */
  broadcast(event) {
    const eventData = {
      type: event.type || 'workflow_update',
      repository: event.repository,
      workflow: event.workflow,
      status: event.status,
      conclusion: event.conclusion,
      branch: event.branch,
      commitMessage: event.commitMessage,
      url: event.url,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    console.log('[EventBroadcaster] Broadcasting event:', JSON.stringify(eventData));
    this.emit('workflow_event', eventData);
  }

  /**
   * Subscribe to workflow events
   * @param {Function} callback - Callback to invoke on new events
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.on('workflow_event', callback);
    console.log('[EventBroadcaster] New subscriber, total:', this.listenerCount('workflow_event'));

    // Return unsubscribe function
    return () => {
      this.off('workflow_event', callback);
      console.log('[EventBroadcaster] Subscriber removed, remaining:', this.listenerCount('workflow_event'));
    };
  }

  /**
   * Get current number of active subscribers
   * @returns {number} Number of active SSE connections
   */
  getSubscriberCount() {
    return this.listenerCount('workflow_event');
  }
}

// Export singleton instance
export const eventBroadcaster = new EventBroadcaster();
