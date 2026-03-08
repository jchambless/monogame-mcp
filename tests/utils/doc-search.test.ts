import { describe, expect, it, vi, afterEach } from 'vitest';
import type { DocEntry } from '../../src/types.js';
import { docs } from '../../src/docs/index.js';
import { DocSearchEngine } from '../../src/utils/doc-search.js';

function createDocEntries(): DocEntry[] {
  return [
    ...docs.api.map((entry) => ({ ...entry, category: 'api', content: '' })),
    ...docs.examples.map((entry) => ({ ...entry, category: 'examples', content: '' })),
    ...docs.contentPipeline.map((entry) => ({ ...entry, category: 'content-pipeline', content: '' })),
    ...docs.platforms.map((entry) => ({ ...entry, category: 'platforms', content: '' })),
  ];
}

describe('DocSearchEngine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('searches SpriteBatch and returns it as top result', async () => {
    const engine = new DocSearchEngine(createDocEntries());

    const results = await engine.search('SpriteBatch');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.title).toBe('SpriteBatch');
  });

  it('searches draw sprite and returns SpriteBatch and sprite-rendering docs', async () => {
    const engine = new DocSearchEngine(createDocEntries());

    const results = await engine.search('draw sprite', { limit: 10 });
    const resultTitles = results.map((result) => result.entry.title);

    expect(resultTitles).toContain('SpriteBatch');
    expect(resultTitles).toContain('Sprite Rendering');
  });

  it('filters search results by namespace', async () => {
    const engine = new DocSearchEngine(createDocEntries());

    const results = await engine.search('input', {
      namespace: 'Microsoft.Xna.Framework.Input',
      limit: 20,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.entry.namespace === 'Microsoft.Xna.Framework.Input')).toBe(true);
  });

  it('returns empty array for empty and non-matching queries', async () => {
    const engine = new DocSearchEngine(createDocEntries());

    const emptyQueryResults = await engine.search('');
    const noMatchResults = await engine.search('no-such-monogame-symbol-xyz');

    expect(emptyQueryResults).toEqual([]);
    expect(noMatchResults).toEqual([]);
  });

  it('gets class by exact class name lookup (case-insensitive)', () => {
    const engine = new DocSearchEngine(createDocEntries());

    const result = engine.getByClassName('texture2d');

    expect(result).toBeDefined();
    expect(result?.title).toBe('Texture2D');
  });

  it('returns all docs in examples category', () => {
    const engine = new DocSearchEngine(createDocEntries());

    const results = engine.getByCategory('examples');

    expect(results).toHaveLength(7);
    expect(results.every((result) => result.category === 'examples')).toBe(true);
  });

  it('loads markdown content lazily and caches file contents across searches', async () => {
    const engine = new DocSearchEngine(createDocEntries());
    const cache = (engine as unknown as { contentCache: Map<string, string> }).contentCache;

    expect(cache.size).toBe(0);

    await engine.search('spritebatch', { category: 'api', limit: 10 });
    const cacheSizeAfterFirstSearch = cache.size;
    await engine.search('spritebatch', { category: 'api', limit: 10 });

    expect(cacheSizeAfterFirstSearch).toBeGreaterThan(0);
    expect(cacheSizeAfterFirstSearch).toBeLessThan(52);
    expect(cache.size).toBe(cacheSizeAfterFirstSearch);
  });
});
