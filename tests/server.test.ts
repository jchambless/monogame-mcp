import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

describe('MCP Server — Integration Tests (TDD)', () => {
  let server: any;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create server using factory
    server = createServer();

    // Create linked transport pair for in-memory communication
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Connect server to transport
    await server.connect(serverTransport);
  });

  afterEach(async () => {
    // Clean up connections
    try {
      await server.close();
    } catch (e) {
      // May already be closed
    }
  });

  it('Server initializes without errors', async () => {
    // Verify server instance is created and ready
    expect(server).toBeDefined();
    expect(server.connect).toBeDefined();
    expect(typeof server.connect).toBe('function');
  });

  it('Server responds to initialize with capabilities', async () => {
    // Send initialize message via raw transport
    let initializeResponse: any = null;
    let messageReceived = false;

    // Listen for response from server
    clientTransport.onmessage = (message: any) => {
      if (message.result) {
        initializeResponse = message.result;
        messageReceived = true;
      }
    };

    // Send initialize request via client transport
    clientTransport.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    });

    // Wait for response with timeout
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify server responds with capabilities
    expect(initializeResponse).toBeDefined();
    expect(initializeResponse.capabilities).toBeDefined();
    expect(typeof initializeResponse.capabilities).toBe('object');
    expect(initializeResponse.serverInfo).toBeDefined();
    expect(initializeResponse.serverInfo.name).toBe('monogame-mcp');
    expect(initializeResponse.serverInfo.version).toBe('0.1.0');
  });

  it('Server lists tools with empty array initially', async () => {
    // First initialize
    let initialized = false;
    clientTransport.onmessage = (message: any) => {
      if (message.result?.serverInfo) {
        initialized = true;
      }
    };

    clientTransport.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    });

    // Wait for initialize response
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (initialized) {
          clearInterval(check);
          resolve(null);
        }
      }, 10);
      setTimeout(() => clearInterval(check), 1000);
    });

    // Then request tools list
    let toolsResponse: any = null;
    clientTransport.onmessage = (message: any) => {
      if (message.result?.tools !== undefined) {
        toolsResponse = message.result;
      }
    };

    clientTransport.send({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify response structure
    expect(toolsResponse).toBeDefined();
    expect(Array.isArray(toolsResponse.tools)).toBe(true);
    expect(toolsResponse.tools.length).toBe(0);
  });

  it('Server lists resources with empty array initially', async () => {
    // First initialize
    let initialized = false;
    clientTransport.onmessage = (message: any) => {
      if (message.result?.serverInfo) {
        initialized = true;
      }
    };

    clientTransport.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    });

    // Wait for initialize response
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (initialized) {
          clearInterval(check);
          resolve(null);
        }
      }, 10);
      setTimeout(() => clearInterval(check), 1000);
    });

    // Then request resources list
    let resourcesResponse: any = null;
    clientTransport.onmessage = (message: any) => {
      if (message.result?.resources !== undefined) {
        resourcesResponse = message.result;
      }
    };

    clientTransport.send({
      jsonrpc: '2.0',
      id: 2,
      method: 'resources/list',
      params: {}
    });

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify response structure
    expect(resourcesResponse).toBeDefined();
    expect(Array.isArray(resourcesResponse.resources)).toBe(true);
    expect(resourcesResponse.resources.length).toBe(0);
  });

  it('Server lists prompts with empty array initially', async () => {
    // First initialize
    let initialized = false;
    clientTransport.onmessage = (message: any) => {
      if (message.result?.serverInfo) {
        initialized = true;
      }
    };

    clientTransport.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    });

    // Wait for initialize response
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (initialized) {
          clearInterval(check);
          resolve(null);
        }
      }, 10);
      setTimeout(() => clearInterval(check), 1000);
    });

    // Then request prompts list
    let promptsResponse: any = null;
    clientTransport.onmessage = (message: any) => {
      if (message.result?.prompts !== undefined) {
        promptsResponse = message.result;
      }
    };

    clientTransport.send({
      jsonrpc: '2.0',
      id: 2,
      method: 'prompts/list',
      params: {}
    });

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify response structure
    expect(promptsResponse).toBeDefined();
    expect(Array.isArray(promptsResponse.prompts)).toBe(true);
    expect(promptsResponse.prompts.length).toBe(0);
  });

  it('Server factory function returns different instances', () => {
    // Create two servers using factory
    const server1 = createServer();
    const server2 = createServer();

    // Verify they are different instances
    expect(server1).not.toBe(server2);
    expect(server1).toBeDefined();
    expect(server2).toBeDefined();
  });
});

