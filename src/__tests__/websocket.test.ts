import { describe, it, expect } from 'vitest';
import { getWebSocketUrl, ObsChainWebSocketClient } from '../api/websocket';

describe('getWebSocketUrl', () => {
  it('converts http URL to ws URL with /api/v1/ws path', () => {
    expect(getWebSocketUrl('http://localhost:8080')).toBe(
      'ws://localhost:8080/api/v1/ws'
    );
    expect(getWebSocketUrl('http://localhost:8080/')).toBe(
      'ws://localhost:8080/api/v1/ws'
    );
  });

  it('converts https URL to wss URL', () => {
    expect(getWebSocketUrl('https://api.obschain.org')).toBe(
      'wss://api.obschain.org/api/v1/ws'
    );
  });

  it('preserves existing ws/wss URLs', () => {
    expect(getWebSocketUrl('ws://127.0.0.1:8080/api/v1/ws')).toBe(
      'ws://127.0.0.1:8080/api/v1/ws'
    );
    expect(getWebSocketUrl('wss://node.obschain.org/api/v1/ws')).toBe(
      'wss://node.obschain.org/api/v1/ws'
    );
  });
});

describe('ObsChainWebSocketClient initial state & lifecycle', () => {
  it('initializes in disconnected state', () => {
    const client = new ObsChainWebSocketClient({
      url: 'ws://localhost:8080/api/v1/ws',
    });
    expect(client.getState()).toBe('disconnected');
  });

  it('notifies state change listeners on subscription', () => {
    const client = new ObsChainWebSocketClient();
    let observedState = '';
    const unsub = client.onStateChange((state) => {
      observedState = state;
    });

    expect(observedState).toBe('disconnected');
    unsub();
  });
});
