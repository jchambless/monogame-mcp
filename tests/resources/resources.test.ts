import { describe, expect, it, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/server.js';
import { registerResources } from '../../src/resources/index.js';
import { DocSearchEngine } from '../../src/utils/doc-search.js';
import { getAllDocs } from '../../src/docs/index.js';
import type { DocEntry } from '../../src/types.js';

describe('Resources', () => {
  let client: Client;

  beforeEach(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    
    const server = createServer();
    
    // Convert DocMetadata to DocEntry format for DocSearchEngine
    const allDocs = getAllDocs();
    const docEntries: DocEntry[] = allDocs.map(doc => ({
      ...doc,
      content: '' // Content will be lazy-loaded
    }));
    
    const docSearchEngine = new DocSearchEngine(docEntries);
    registerResources(server, docSearchEngine);
    
    await server.connect(serverTransport);
    
    client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      },
    );
    
    await client.connect(clientTransport);
  });

  describe('API Reference Resources', () => {
    it('should return API doc for valid class name SpriteBatch', async () => {
      const result = await client.readResource({ uri: 'monogame://api/SpriteBatch' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('monogame://api/SpriteBatch');
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toBeDefined();
        expect(result.contents[0].text).toContain('SpriteBatch');
      }
    });

    it('should return not found for nonexistent class', async () => {
      const result = await client.readResource({ uri: 'monogame://api/NonexistentClass' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toContain('not found');
        expect(result.contents[0].text).toContain('NonexistentClass');
      }
    });
  });

  describe('Code Examples Resources', () => {
    it('should return example doc for valid topic input-handling', async () => {
      const result = await client.readResource({ uri: 'monogame://examples/input-handling' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('monogame://examples/input-handling');
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toBeDefined();
        expect(result.contents[0].text).toContain('Input');
      }
    });

    it('should return not found for invalid example topic', async () => {
      const result = await client.readResource({ uri: 'monogame://examples/invalid-topic' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toContain('not found');
        expect(result.contents[0].text).toContain('invalid-topic');
      }
    });
  });

  describe('Content Pipeline Resources', () => {
    it('should return pipeline doc for valid topic overview', async () => {
      const result = await client.readResource({ uri: 'monogame://content-pipeline/overview' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('monogame://content-pipeline/overview');
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toBeDefined();
        expect(result.contents[0].text).toContain('Pipeline');
      }
    });

    it('should return not found for invalid pipeline topic', async () => {
      const result = await client.readResource({ uri: 'monogame://content-pipeline/invalid' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toContain('not found');
      }
    });
  });

  describe('Platform Guides Resources', () => {
    it('should return platform doc for desktopgl', async () => {
      const result = await client.readResource({ uri: 'monogame://platforms/desktopgl' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('monogame://platforms/desktopgl');
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toBeDefined();
        expect(result.contents[0].text).toContain('DesktopGL');
      }
    });

    it('should return not found for invalid platform', async () => {
      const result = await client.readResource({ uri: 'monogame://platforms/invalid-platform' });
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/plain');
      expect('text' in result.contents[0]).toBe(true);
      if ('text' in result.contents[0]) {
        expect(result.contents[0].text).toContain('not found');
      }
    });
  });

  describe('Resource List', () => {
    it('should return all available resource URIs', async () => {
      const result = await client.listResources();
      
      expect(result.resources).toBeInstanceOf(Array);
      expect(result.resources.length).toBeGreaterThan(0);
      
      // Check that we have resources from all 4 categories
      const uris = result.resources.map(r => r.uri);
      expect(uris.some(uri => uri.startsWith('monogame://api/'))).toBe(true);
      expect(uris.some(uri => uri.startsWith('monogame://examples/'))).toBe(true);
      expect(uris.some(uri => uri.startsWith('monogame://content-pipeline/'))).toBe(true);
      expect(uris.some(uri => uri.startsWith('monogame://platforms/'))).toBe(true);
    });

    it('should include metadata for each resource', async () => {
      const result = await client.listResources();
      
      expect(result.resources.length).toBeGreaterThan(0);
      
      for (const resource of result.resources) {
        expect(resource.uri).toBeDefined();
        expect(resource.name).toBeDefined();
        expect(resource.mimeType).toBe('text/markdown');
      }
    });
  });
});
