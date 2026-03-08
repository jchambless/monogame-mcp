import { describe, expect, it } from 'vitest';
import { apiLookupTool, handleApiLookup } from '../../src/tools/api-lookup.js';

function getText(result: { content: Array<{ type: string; text?: string }> }): string {
  const textBlock = result.content.find((item) => item.type === 'text');
  return textBlock?.text ?? '';
}

function extractFieldValues(markdown: string, fieldName: string): string[] {
  const escapedField = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\*\\*${escapedField}\\*\\*: ([^\\n]+)`, 'g');
  return [...markdown.matchAll(pattern)].map((match) => match[1].trim());
}

describe('API Lookup Tool', () => {
  it('exports tool metadata for monogame_api_lookup', () => {
    expect(apiLookupTool.name).toBe('monogame_api_lookup');
    expect(apiLookupTool.description).toBe(
      'Search MonoGame API documentation for classes, methods, and properties',
    );
  });

  it('search SpriteBatch returns class doc with namespace and methods', async () => {
    const result = await handleApiLookup({ query: 'SpriteBatch' });
    const markdown = getText(result);

    expect(result.isError).not.toBe(true);
    expect(markdown).toContain('# MonoGame API Documentation');
    expect(markdown).toContain('## SpriteBatch');
    expect(markdown).toContain('**Namespace**: Microsoft.Xna.Framework.Graphics');
    expect(markdown).toContain('### Key Methods');
    expect(markdown).toContain('`Draw()`');
    expect(markdown).toContain('```csharp');
  });

  it('search draw returns multiple ranked results including SpriteBatch and Sprite Rendering', async () => {
    const result = await handleApiLookup({ query: 'draw', limit: 10 });
    const markdown = getText(result);

    expect(result.isError).not.toBe(true);
    expect(markdown).toContain('## SpriteBatch');
    expect(markdown).toContain('## Sprite Rendering');
    expect(markdown).toContain('---');
  });

  it('namespace filter returns only docs from that namespace', async () => {
    const result = await handleApiLookup({
      query: 'state',
      namespace: 'Microsoft.Xna.Framework.Input',
      limit: 10,
    });
    const markdown = getText(result);
    const namespaces = extractFieldValues(markdown, 'Namespace');

    expect(result.isError).not.toBe(true);
    expect(namespaces.length).toBeGreaterThan(0);
    expect(namespaces.every((value) => value === 'Microsoft.Xna.Framework.Input')).toBe(true);
  });

  it('category filter returns only docs from requested category', async () => {
    const result = await handleApiLookup({ query: 'draw', category: 'api', limit: 10 });
    const markdown = getText(result);
    const categories = extractFieldValues(markdown, 'Category');

    expect(result.isError).not.toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((value) => value === 'api')).toBe(true);
    expect(markdown).not.toContain('## Sprite Rendering');
  });

  it('returns helpful message when no docs match query', async () => {
    const result = await handleApiLookup({ query: 'xyznonexistent' });
    const markdown = getText(result);

    expect(result.isError).not.toBe(true);
    expect(markdown).toContain("No results found for 'xyznonexistent'.");
    expect(markdown).toContain('Try:');
  });

  it('returns validation error for empty query', async () => {
    const result = await handleApiLookup({ query: '' });
    const markdown = getText(result);

    expect(result.isError).toBe(true);
    expect(markdown).toContain('Validation error');
    expect(markdown).toContain('query');
  });
});
