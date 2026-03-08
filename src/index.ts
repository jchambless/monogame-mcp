#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Initialize MCP server
const _server = new Server({
  name: 'monogame-mcp',
  version: '0.1.0'
}, {
  capabilities: {}
});

// Setup stdio transport
const _transport = new StdioServerTransport();

// Server is initialized but not started yet
// Tool/resource/prompt registration will happen in subsequent tasks
