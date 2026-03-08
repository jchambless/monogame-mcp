import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Factory function to create a configured MCP Server instance.
 * 
 * Returns a Server instance WITHOUT connecting a transport.
 * This allows flexibility for:
 * - Integration testing via InMemoryTransport
 * - Different transport types (stdio, SSE, WebSocket, etc.)
 * - Dependency injection and mocking
 * 
 * @returns Configured Server instance ready for connection
 */
export function createServer(): Server {
  // Server configuration info
  const serverInfo = {
    name: 'monogame-mcp',
    version: '0.1.0'
  };

  // Capabilities registration (initially empty/stub)
  const capabilities = {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  };

  // Create server instance with two-argument constructor
  const server = new Server(serverInfo, capabilities);

  // Register request handlers for protocol methods
  // These will be populated with actual implementations in Tasks 10-16

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Empty tools list initially, will be populated in Tasks 10-12
    return {
      tools: []
    };
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // Empty resources list initially, will be populated in Tasks 13-14
    return {
      resources: []
    };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    // Empty prompts list initially, will be populated in Task 15
    return {
      prompts: []
    };
  });

  return server;
}


