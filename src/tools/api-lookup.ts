import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ZodError, z } from 'zod';
import { docs } from '../docs/index.js';
import type { DocEntry, DocSearchResult } from '../types.js';
import { DocSearchEngine } from '../utils/doc-search.js';

type LookupCategory = 'api' | 'examples' | 'content-pipeline' | 'platforms';

const inputSchema = z.object({
  query: z.string().trim().min(1, 'query is required'),
  namespace: z.string().trim().min(1, 'namespace cannot be empty').optional(),
  category: z.enum(['api', 'examples', 'content-pipeline', 'platforms']).optional(),
  limit: z.number().int().min(1).max(10).default(5),
});

export const apiLookupTool = {
  name: 'monogame_api_lookup',
  description: 'Search MonoGame API documentation for classes, methods, and properties',
  inputSchema,
};

const docEntries: DocEntry[] = [
  ...docs.api.map((entry) => ({ ...entry, category: 'api', content: '' })),
  ...docs.examples.map((entry) => ({ ...entry, category: 'examples', content: '' })),
  ...docs.contentPipeline.map((entry) => ({ ...entry, category: 'content-pipeline', content: '' })),
  ...docs.platforms.map((entry) => ({ ...entry, category: 'platforms', content: '' })),
];

const searchEngine = new DocSearchEngine(docEntries);
const docContentCache: Map<string, string> = new Map();

export async function handleApiLookup(args: unknown): Promise<CallToolResult> {
  let input: z.infer<typeof inputSchema>;

  try {
    input = inputSchema.parse(args);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Validation error: ${error.issues.map((issue) => issue.message).join('; ')}`,
          },
        ],
      };
    }

    throw error;
  }

  const exactMatch = searchEngine.getByClassName(input.query);
  if (exactMatch && passesFilters(exactMatch, input.namespace, input.category)) {
    const markdown = await formatExactMatchResult(exactMatch);
    return {
      content: [
        {
          type: 'text',
          text: markdown,
        },
      ],
    };
  }

  const filteredPaths = getFilteredPathSet(input.namespace, input.category);
  let results = await searchEngine.search(input.query, {
    namespace: input.namespace,
    category: input.category,
    limit: 10,
  });

  if (filteredPaths !== null) {
    results = results.filter((result) => filteredPaths.has(result.entry.path));
  }

  results = results.slice(0, input.limit);

  if (results.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: formatNoResultsMessage(input.query),
        },
      ],
    };
  }

  const markdown = await formatSearchResults(results);
  return {
    content: [
      {
        type: 'text',
        text: markdown,
      },
    ],
  };
}

function passesFilters(entry: DocEntry, namespace?: string, category?: LookupCategory): boolean {
  if (namespace && entry.namespace !== namespace) {
    return false;
  }

  if (category && entry.category !== category) {
    return false;
  }

  return true;
}

function getFilteredPathSet(namespace?: string, category?: LookupCategory): Set<string> | null {
  let entries: DocEntry[] | null = null;

  if (namespace) {
    entries = searchEngine.getByNamespace(namespace);
  }

  if (category) {
    const categoryEntries = searchEngine.getByCategory(category);
    entries = entries === null
      ? categoryEntries
      : entries.filter((entry) => categoryEntries.some((categoryEntry) => categoryEntry.path === entry.path));
  }

  if (entries === null) {
    return null;
  }

  return new Set(entries.map((entry) => entry.path));
}

async function formatExactMatchResult(entry: DocEntry): Promise<string> {
  const content = await loadDocContent(entry.path);
  const sections: string[] = ['# MonoGame API Documentation', ''];
  sections.push(await formatEntry(entry, content, true));
  return sections.join('\n');
}

async function formatSearchResults(results: DocSearchResult[]): Promise<string> {
  const sections: string[] = ['# MonoGame API Documentation', ''];

  for (const [index, result] of results.entries()) {
    const content = await loadDocContent(result.entry.path);
    sections.push(await formatEntry(result.entry, content));

    if (index < results.length - 1) {
      sections.push('');
      sections.push('---');
      sections.push('');
    }
  }

  return sections.join('\n');
}

async function formatEntry(entry: DocEntry, content: string, includeKeyMethods = false): Promise<string> {
  const summary = extractSummary(content);
  const codeExample = extractCodeExample(content);
  const keyMethods = includeKeyMethods ? extractKeyMethods(content) : [];
  const lines: string[] = [
    `## ${entry.title}`,
    `**Namespace**: ${entry.namespace ?? '(not specified)'}`,
    `**Category**: ${entry.category}`,
    '',
    '### Summary',
    summary,
  ];

  if (keyMethods.length > 0) {
    lines.push('');
    lines.push('### Key Methods');
    keyMethods.forEach((method) => {
      lines.push(`- \`${method}\``);
    });
  }

  if (codeExample) {
    lines.push('');
    lines.push('### Code Example');
    lines.push('```csharp');
    lines.push(codeExample);
    lines.push('```');
  }

  return lines.join('\n');
}

function extractSummary(content: string): string {
  const summaryMatch = content.match(/## Summary\s*([\s\S]*?)(?:\n##\s|$)/i);
  if (summaryMatch?.[1]) {
    return summaryMatch[1].trim();
  }

  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('**Namespace:**') || line.startsWith('```')) {
      continue;
    }

    return line;
  }

  return 'No summary available.';
}

function extractCodeExample(content: string): string | null {
  const codeMatch = content.match(/```csharp\s*([\s\S]*?)```/i);
  if (!codeMatch?.[1]) {
    return null;
  }

  return codeMatch[1].trim();
}

function extractKeyMethods(content: string): string[] {
  const methodsSectionMatch = content.match(/## Methods\s*([\s\S]*?)(?:\n##\s|$)/i);
  if (!methodsSectionMatch?.[1]) {
    return [];
  }

  const methodNames = [...methodsSectionMatch[1].matchAll(/^###\s+([^\n]+)/gm)]
    .map((match) => match[1].trim());

  return methodNames.slice(0, 6);
}

function formatNoResultsMessage(query: string): string {
  return [
    '# MonoGame API Documentation',
    '',
    `No results found for '${query}'.`,
    '',
    'Try:',
    '- Checking class name spelling (example: `SpriteBatch`, `Texture2D`)',
    '- Using a broader term (example: `draw`, `input`, `content`)',
    '- Removing namespace/category filters',
  ].join('\n');
}

async function loadDocContent(docPath: string): Promise<string> {
  const cachedContent = docContentCache.get(docPath);
  if (cachedContent !== undefined) {
    return cachedContent;
  }

  const fullPath = path.join(process.cwd(), 'src', 'docs', docPath);
  const content = await readFile(fullPath, 'utf-8');
  docContentCache.set(docPath, content);
  return content;
}
