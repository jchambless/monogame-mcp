import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { DocSearchEngine } from '../utils/doc-search.js';
import { getAllDocs } from '../docs/index.js';

/**
 * Register all MonoGame MCP resources with the server.
 * 
 * Resources are exposed via URI templates:
 * - monogame://api/{className} - API reference documentation
 * - monogame://examples/{topic} - Code examples
 * - monogame://content-pipeline/{topic} - Content pipeline documentation
 * - monogame://platforms/{platform} - Platform guides
 * 
 * @param server - MCP Server instance
 * @param docSearchEngine - DocSearchEngine instance for looking up documentation
 */
export function registerResources(server: Server, docSearchEngine: DocSearchEngine): void {
  // Register resource template handlers
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
      resourceTemplates: [
        {
          uriTemplate: 'monogame://api/{className}',
          name: 'MonoGame API Reference',
          description: 'API reference documentation for MonoGame classes',
          mimeType: 'text/markdown',
        },
        {
          uriTemplate: 'monogame://examples/{topic}',
          name: 'MonoGame Code Examples',
          description: 'Code examples and tutorials for MonoGame development',
          mimeType: 'text/markdown',
        },
        {
          uriTemplate: 'monogame://content-pipeline/{topic}',
          name: 'MonoGame Content Pipeline',
          description: 'Documentation for the MonoGame Content Pipeline',
          mimeType: 'text/markdown',
        },
        {
          uriTemplate: 'monogame://platforms/{platform}',
          name: 'MonoGame Platform Guides',
          description: 'Platform-specific guides for MonoGame development',
          mimeType: 'text/markdown',
        },
      ],
    };
  });

  // Register static resource list
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const allDocs = getAllDocs();
    
    const resources = allDocs.map((doc) => {
      let uri: string;
      
      if (doc.category === 'Examples') {
        const topic = doc.path.replace('examples/', '').replace('.md', '');
        uri = `monogame://examples/${topic}`;
      } else if (doc.category === 'Content Pipeline') {
        const topic = doc.path.replace('content-pipeline/', '').replace('.md', '');
        uri = `monogame://content-pipeline/${topic}`;
      } else if (doc.category === 'Platforms') {
        const platform = doc.path.replace('platforms/', '').replace('.md', '');
        uri = `monogame://platforms/${platform}`;
      } else {
        // API docs
        uri = `monogame://api/${doc.title}`;
      }
      
      return {
        uri,
        name: doc.title,
        description: doc.keywords.join(', '),
        mimeType: 'text/markdown',
      };
    });
    
    return { resources };
  });

  // Register read resource handler
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const url = new URL(uri);
    
    if (url.protocol !== 'monogame:') {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Invalid protocol: ${url.protocol}. Expected monogame:`,
          },
        ],
      };
    }
    
    // For monogame://api/SpriteBatch, hostname is "api" and pathname is "/SpriteBatch"
    const resourceType = url.hostname;
    const identifier = url.pathname.startsWith('/') 
      ? url.pathname.substring(1) 
      : url.pathname;
    
    if (!resourceType) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: 'Invalid URI: missing resource type',
          },
        ],
      };
    }
    
    if (!identifier) {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Invalid URI: missing identifier for resource type ${resourceType}`,
          },
        ],
      };
    }
    
    // Handle API reference lookups
    if (resourceType === 'api') {
      const doc = docSearchEngine.getByClassName(identifier);
      
      if (!doc) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `API documentation not found for class: ${identifier}`,
            },
          ],
        };
      }
      
      const content = await loadDocContent(docSearchEngine, doc.path);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: content,
          },
        ],
      };
    }
    
    // Handle examples lookups
    if (resourceType === 'examples') {
      const allDocs = getAllDocs();
      const examplePath = `examples/${identifier}.md`;
      const doc = allDocs.find((d) => d.path === examplePath);
      
      if (!doc) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Example documentation not found for topic: ${identifier}`,
            },
          ],
        };
      }
      
      const content = await loadDocContent(docSearchEngine, doc.path);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: content,
          },
        ],
      };
    }
    
    // Handle content pipeline lookups
    if (resourceType === 'content-pipeline') {
      const allDocs = getAllDocs();
      const pipelinePath = `content-pipeline/${identifier}.md`;
      const doc = allDocs.find((d) => d.path === pipelinePath);
      
      if (!doc) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Content pipeline documentation not found for topic: ${identifier}`,
            },
          ],
        };
      }
      
      const content = await loadDocContent(docSearchEngine, doc.path);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: content,
          },
        ],
      };
    }
    
    // Handle platform guide lookups
    if (resourceType === 'platforms') {
      const allDocs = getAllDocs();
      const platformPath = `platforms/${identifier}.md`;
      const doc = allDocs.find((d) => d.path === platformPath);
      
      if (!doc) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Platform documentation not found for platform: ${identifier}`,
            },
          ],
        };
      }
      
      const content = await loadDocContent(docSearchEngine, doc.path);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: content,
          },
        ],
      };
    }
    
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Unknown resource type: ${resourceType}`,
        },
      ],
    };
  });
}

/**
 * Load document content using DocSearchEngine's internal content loading mechanism.
 * 
 * @param docSearchEngine - DocSearchEngine instance
 * @param docPath - Document path relative to src/docs/
 * @returns Document content as markdown string
 */
async function loadDocContent(docSearchEngine: DocSearchEngine, docPath: string): Promise<string> {
  // Use the search engine's internal content loading by performing a search
  // that will trigger lazy loading, then access the cached content
  const searchResults = await docSearchEngine.search('', { limit: 0 });
  
  // Now use a private method access workaround: search for a unique term in the doc
  // Actually, let's use the public search API properly
  const allDocsMetadata = getAllDocs();
  const docMetadata = allDocsMetadata.find((d) => d.path === docPath);
  
  if (!docMetadata) {
    throw new Error(`Document metadata not found for path: ${docPath}`);
  }
  
  // Search for the document title to trigger content loading
  const results = await docSearchEngine.search(docMetadata.title, { limit: 1 });
  
  if (results.length === 0) {
    throw new Error(`Document content could not be loaded for: ${docPath}`);
  }
  
  // Access the cached content through another search
  // We need to use the private loadContent method, but since we can't access it directly,
  // let's use the fact that search() loads content and returns results
  
  // Actually, let's read the file directly using the same logic as DocSearchEngine
  const { readFile } = await import('node:fs/promises');
  const path = await import('node:path');
  const fullPath = path.join(process.cwd(), 'src', 'docs', docPath);
  const content = await readFile(fullPath, 'utf-8');
  
  return content;
}
