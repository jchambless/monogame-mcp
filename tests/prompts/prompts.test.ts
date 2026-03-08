import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createServer } from '../../src/server.js';
import { registerPrompts } from '../../src/prompts/index.js';

describe('MonoGame Prompts — TDD Tests', () => {
  let client: Client;
  let serverTransport: InMemoryTransport;
  let clientTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create linked transport pair
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Create and register prompts on server
    const server = createServer();
    registerPrompts(server);

    // Connect server to transport
    await server.connect(serverTransport);

    // Create client and connect
    client = new Client({
      name: 'test-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
  });

  // Test 1: Code review prompt returns system and user messages
  it('should return code review prompt with system and user messages', async () => {
    const result = await client.getPrompt({
      name: 'monogame_code_review',
      arguments: { code: 'public class Game1 : Game { }' }
    });

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].content.type).toBe('text');
    expect(result.messages[0].content.text).toContain('SpriteBatch');
    expect(result.messages[1].role).toBe('user');
    expect(result.messages[1].content.type).toBe('text');
    expect(result.messages[1].content.text).toContain('Game1');
  });

  // Test 2: Code review system message includes best practices
  it('should include MonoGame best practices in code review system message', async () => {
    const result = await client.getPrompt({
      name: 'monogame_code_review',
      arguments: { code: 'var game = new Game1();' }
    });

    const systemMessage = result.messages[0].content.text;
    expect(systemMessage).toContain('Content.Load');
    expect(systemMessage).toContain('Update');
    expect(systemMessage).toContain('Draw');
    expect(systemMessage).toContain('dispose');
  });

  // Test 3: Code review handles optional focus parameter
  it('should handle optional focus parameter in code review', async () => {
    const result = await client.getPrompt({
      name: 'monogame_code_review',
      arguments: { 
        code: 'spriteBatch.Begin();',
        focus: 'performance'
      }
    });

    const systemMessage = result.messages[0].content.text;
    expect(systemMessage).toContain('performance');
  });

  // Test 4: Troubleshooting prompt returns system and user messages
  it('should return troubleshooting prompt with system and user messages', async () => {
    const result = await client.getPrompt({
      name: 'monogame_troubleshoot',
      arguments: { error: 'ContentLoadException: Could not load asset' }
    });

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].content.type).toBe('text');
    expect(result.messages[1].role).toBe('user');
    expect(result.messages[1].content.type).toBe('text');
    expect(result.messages[1].content.text).toContain('ContentLoadException');
  });

  // Test 5: Troubleshooting system message includes diagnostic steps
  it('should include diagnostic steps in troubleshooting system message', async () => {
    const result = await client.getPrompt({
      name: 'monogame_troubleshoot',
      arguments: { error: 'NullReferenceException in Update' }
    });

    const systemMessage = result.messages[0].content.text;
    expect(systemMessage).toContain('Content.RootDirectory');
    expect(systemMessage).toContain('GraphicsDevice');
  });

  // Test 6: Architecture prompt returns system and user messages
  it('should return architecture prompt with system and user messages', async () => {
    const result = await client.getPrompt({
      name: 'monogame_architecture',
      arguments: { gameType: '2d-platformer' }
    });

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].content.type).toBe('text');
    expect(result.messages[1].role).toBe('user');
    expect(result.messages[1].content.type).toBe('text');
    expect(result.messages[1].content.text).toContain('2d-platformer');
  });

  // Test 7: Architecture system message includes component patterns
  it('should include architecture patterns in system message', async () => {
    const result = await client.getPrompt({
      name: 'monogame_architecture',
      arguments: { gameType: 'puzzle' }
    });

    const systemMessage = result.messages[0].content.text;
    expect(systemMessage).toContain('GameComponent');
    expect(systemMessage).toContain('scene');
  });

  // Test 8: Feature implementation prompt returns system and user messages
  it('should return feature implementation prompt with system and user messages', async () => {
    const result = await client.getPrompt({
      name: 'monogame_implement_feature',
      arguments: { feature: 'sprite animation system' }
    });

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].content.type).toBe('text');
    expect(result.messages[1].role).toBe('user');
    expect(result.messages[1].content.type).toBe('text');
    expect(result.messages[1].content.text).toContain('sprite animation');
  });

  // Test 9: Feature implementation system message includes game loop lifecycle
  it('should include game loop lifecycle in feature implementation system message', async () => {
    const result = await client.getPrompt({
      name: 'monogame_implement_feature',
      arguments: { feature: 'collision detection' }
    });

    const systemMessage = result.messages[0].content.text;
    expect(systemMessage).toContain('Initialize');
    expect(systemMessage).toContain('LoadContent');
    expect(systemMessage).toContain('Update');
    expect(systemMessage).toContain('Draw');
  });

  // Test 10: All prompts handle optional parameters gracefully
  it('should handle all optional parameters for all prompts', async () => {
    // Code review with focus
    const review = await client.getPrompt({
      name: 'monogame_code_review',
      arguments: { code: 'test', focus: 'rendering' }
    });
    expect(review.messages).toHaveLength(2);

    // Troubleshoot with code and platform
    const troubleshoot = await client.getPrompt({
      name: 'monogame_troubleshoot',
      arguments: { error: 'test error', code: 'test code', platform: 'DesktopGL' }
    });
    expect(troubleshoot.messages).toHaveLength(2);

    // Architecture with features and scale
    const architecture = await client.getPrompt({
      name: 'monogame_architecture',
      arguments: { gameType: 'puzzle', features: 'level editor', scale: 'small' }
    });
    expect(architecture.messages).toHaveLength(2);

    // Feature with existingCode and platform
    const feature = await client.getPrompt({
      name: 'monogame_implement_feature',
      arguments: { feature: 'test', existingCode: 'existing', platform: 'WindowsDX' }
    });
    expect(feature.messages).toHaveLength(2);
  });
});
