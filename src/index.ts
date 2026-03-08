#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

/**
 * Main entry point for MonoGame MCP Server
 * 
 * Creates server instance and connects stdio transport for JSON-RPC communication.
 * The server processes requests from connected MCP clients over standard input/output.
 */
async function main() {
  try {
    // Create server using factory function
    const server = createServer();

    // Create stdio transport for JSON-RPC communication
    const transport = new StdioServerTransport();

    // Connect server to transport
    // This starts listening for JSON-RPC messages on stdin
    await server.connect(transport);

    // Server is now running and will handle requests until process termination
    // Tool/resource/prompt implementations added in Tasks 10-16
  } catch (error) {
    console.error('Failed to start MCP server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Start the server
main();

