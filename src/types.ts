/**
 * MonoGame MCP Server - Shared Type Definitions
 * 
 * This module exports all shared TypeScript interfaces and enums used across
 * the MonoGame MCP server, including documentation types, subprocess handling,
 * MGCB file handling, and MonoGame-specific enums.
 */

/**
 * Enum of MonoGame namespaces.
 * Maps to the primary namespaces available in the MonoGame framework.
 */
export enum MonoGameNamespace {
  Framework = 'Microsoft.Xna.Framework',
  Audio = 'Microsoft.Xna.Framework.Audio',
  Content = 'Microsoft.Xna.Framework.Content',
  Graphics = 'Microsoft.Xna.Framework.Graphics',
  Input = 'Microsoft.Xna.Framework.Input',
  Media = 'Microsoft.Xna.Framework.Media',
}

/**
 * Documentation entry interface.
 * Represents a single documentation page or section in the MonoGame documentation.
 */
export interface DocEntry {
  path: string;
  title: string;
  namespace?: string;
  category: string;
  keywords: string[];
  content: string;
}

/**
 * Documentation search result interface.
 * Represents a search result with relevance scoring.
 */
export interface DocSearchResult {
  entry: DocEntry;
  relevanceScore: number;
  matchedSection?: string;
}

/**
 * Tool result interface aligned with MCP SDK's CallToolResult.
 * Used as the return type for MCP tools.
 */
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export type ContentBlock = TextContent | ImageContent;

export interface ToolResult {
  content: ContentBlock[];
  isError?: boolean;
}

/**
 * Subprocess execution result interface.
 * Captures output and status of spawned subprocess commands.
 */
export interface SubprocessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

/**
 * Subprocess execution options interface.
 * Configuration for spawning subprocess commands.
 */
export interface SubprocessOptions {
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
  args?: string[];
}

/**
 * MGCB content entry interface.
 * Represents a single asset entry in a .mgcb (MonoGame Content Builder) file.
 */
export interface MgcbEntry {
  path: string;
  importer: string;
  processor: string;
  processorParams: Record<string, string>;
  buildAction: string;
}

/**
 * MGCB project interface.
 * Represents a parsed .mgcb file with all global settings and content entries.
 */
export interface MgcbProject {
  outputDir: string;
  intermediateDir: string;
  platform: string;
  references: string[];
  entries: MgcbEntry[];
}

/**
 * Error pattern interface.
 * Used for error diagnosis and pattern matching against compilation errors.
 */
export interface ErrorPattern {
  regex: RegExp;
  errorType: string;
  description: string;
  cause: string;
  solution: string;
  docLinks: string[];
}

/**
 * Code scaffolding template interface.
 * Represents a template for code generation with parameter placeholders.
 */
export interface ScaffoldTemplate {
  name: string;
  description: string;
  category: string;
  template: string;
  parameters: string[];
}

/**
 * Enum of supported MonoGame target platforms.
 */
export enum MonoGamePlatform {
  DesktopGL = 'DesktopGL',
  WindowsDX = 'WindowsDX',
  Android = 'Android',
  iOS = 'iOS',
}

/**
 * Enum of MonoGame dotnet template short names.
 * Maps to the template names used with `dotnet new` command.
 */
export enum MonoGameTemplate {
  DesktopGL = 'mgdesktopgl',
  WindowsDX = 'mgwindowsdx',
  Android = 'mgandroid',
  iOS = 'mgios',
  Shared = 'mgshared',
}
