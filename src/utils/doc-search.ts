import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { DocEntry, DocSearchResult } from '../types.js';

export interface DocSearchOptions {
  category?: string;
  namespace?: string;
  limit?: number;
}

export class DocSearchEngine {
  private readonly docs: DocEntry[];

  private readonly contentCache: Map<string, string> = new Map();

  constructor(docs: DocEntry[]) {
    this.docs = docs;
  }

  async search(query: string, options?: DocSearchOptions): Promise<DocSearchResult[]> {
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 0);

    if (tokens.length === 0) {
      return [];
    }

    const categoryFilter = options?.category?.toLowerCase();
    const namespaceFilter = options?.namespace?.toLowerCase();
    const limit = options?.limit ?? 5;

    let candidateDocs = this.docs;

    if (categoryFilter) {
      candidateDocs = candidateDocs.filter((doc) => doc.category.toLowerCase() === categoryFilter);
    }

    if (namespaceFilter) {
      candidateDocs = candidateDocs.filter(
        (doc) => doc.namespace?.toLowerCase() === namespaceFilter,
      );
    }

    const results: DocSearchResult[] = [];

    for (const doc of candidateDocs) {
      let score = 0;
      const title = doc.title.toLowerCase();
      const keywords = doc.keywords.map((keyword) => keyword.toLowerCase());
      const content = (await this.loadContent(doc.path)).toLowerCase();

      for (const token of tokens) {
        if (title.includes(token)) {
          score += 3;
        }

        for (const keyword of keywords) {
          if (keyword.includes(token)) {
            score += 2;
          }
        }

        if (content.includes(token)) {
          score += 1;
        }
      }

      if (score > 0) {
        results.push({
          entry: doc,
          relevanceScore: score,
        });
      }
    }

    results.sort((left, right) => right.relevanceScore - left.relevanceScore);

    if (limit < 1) {
      return [];
    }

    return results.slice(0, limit);
  }

  getByClassName(className: string): DocEntry | undefined {
    const normalizedClassName = className.toLowerCase();
    return this.docs.find((doc) => doc.title.toLowerCase() === normalizedClassName);
  }

  getByNamespace(namespace: string): DocEntry[] {
    const normalizedNamespace = namespace.toLowerCase();
    return this.docs.filter((doc) => doc.namespace?.toLowerCase() === normalizedNamespace);
  }

  getByCategory(category: string): DocEntry[] {
    const normalizedCategory = category.toLowerCase();
    return this.docs.filter((doc) => doc.category.toLowerCase() === normalizedCategory);
  }

  private async loadContent(docPath: string): Promise<string> {
    const cachedContent = this.contentCache.get(docPath);
    if (cachedContent !== undefined) {
      return cachedContent;
    }

    const fullPath = path.join(process.cwd(), 'src', 'docs', docPath);
    const content = await readFile(fullPath, 'utf-8');
    this.contentCache.set(docPath, content);
    return content;
  }
}
