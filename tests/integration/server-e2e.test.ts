import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

import { createServer } from '../../src/server.js';
import { registerPrompts } from '../../src/prompts/index.js';
import { registerResources } from '../../src/resources/index.js';
import { getAllDocs } from '../../src/docs/index.js';
import { DocSearchEngine } from '../../src/utils/doc-search.js';
import type { DocEntry } from '../../src/types.js';
import * as subprocess from '../../src/utils/subprocess.js';

import { apiLookupTool, handleApiLookup } from '../../src/tools/api-lookup.js';
import { buildContentTool, handleBuildContent } from '../../src/tools/build-content.js';
import { handleBuildRun } from '../../src/tools/build-run.js';
import { createProjectTool, handleCreateProject } from '../../src/tools/create-project.js';
import { handleDiagnoseError } from '../../src/tools/diagnose-error.js';
import { handleManageContent, manageContentTool } from '../../src/tools/manage-content.js';
import { handleScaffoldCode } from '../../src/tools/scaffold-code.js';

type ToolHandler = (args: unknown) => Promise<CallToolResult>;

const BASE_MGCB = `#----------------------------- Global Properties ----------------------------#

/outputDir:bin/$(Platform)
/intermediateDir:obj/$(Platform)
/platform:DesktopGL
/config:
/profile:Reach
/compress:False

#-------------------------------- References --------------------------------#


#---------------------------------- Content ---------------------------------#

#begin Sprites/player.png
/importer:TextureImporter
/processor:TextureProcessor
/build:Sprites/player.png
`;

function getText(result: { content: Array<{ type: string; text?: string }> }): string {
  const textContent = result.content.find((item) => item.type === 'text');
  return textContent?.text ?? '';
}

function getResourceText(result: { contents: Array<{ uri: string; text?: string }> }): string {
  return result.contents[0]?.text ?? '';
}

function registerTestTools(server: ReturnType<typeof createServer>): void {
  const toolHandlers: Record<string, ToolHandler> = {
    [apiLookupTool.name]: handleApiLookup,
    [createProjectTool.name]: handleCreateProject,
    [manageContentTool.name]: handleManageContent,
    [buildContentTool.name]: handleBuildContent,
    monogame_scaffold_code: handleScaffoldCode,
    monogame_diagnose_error: handleDiagnoseError,
    monogame_build_run: handleBuildRun,
  };

  const tools = [
    apiLookupTool,
    createProjectTool,
    manageContentTool,
    buildContentTool,
    {
      name: 'monogame_scaffold_code',
      description: 'Generate MonoGame C# code from predefined templates',
    },
    { name: 'monogame_diagnose_error', description: 'Diagnose MonoGame runtime and build errors' },
    {
      name: 'monogame_build_run',
      description: 'Build or run MonoGame projects using dotnet CLI',
    },
  ].map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: { type: 'object', properties: {} },
  }));

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const handler = toolHandlers[request.params.name];
    if (!handler) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    return handler(request.params.arguments ?? {});
  });
}

describe('MonoGame MCP Server E2E Integration', () => {
  let server: ReturnType<typeof createServer>;
  let client: Client;
  let tempDir: string;
  let mgcbPath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'monogame-mcp-e2e-'));
    mgcbPath = path.join(tempDir, 'Content.mgcb');
    await writeFile(mgcbPath, BASE_MGCB, 'utf-8');

    vi.spyOn(subprocess, 'checkPrerequisite').mockResolvedValue({
      available: true,
      message: 'tool available',
      version: 'mocked',
    });

    vi.spyOn(subprocess, 'executeCommand').mockImplementation(async (command, args) => {
      if (command === 'dotnet' && args[0] === 'new' && args[1] === 'list') {
        return {
          success: true,
          exitCode: 0,
          stdout: 'mgdesktopgl mgwindowsdx mgandroid mgios mgshared',
          stderr: '',
          timedOut: false,
        };
      }

      if (command === 'dotnet' && args[0] === 'new') {
        return {
          success: true,
          exitCode: 0,
          stdout: 'Template created successfully',
          stderr: '',
          timedOut: false,
        };
      }

      if (command === 'mgcb') {
        return {
          success: true,
          exitCode: 0,
          stdout: 'Building content...\nProcessed 3 files successfully.',
          stderr: '',
          timedOut: false,
        };
      }

      if (command === 'dotnet' && args[0] === 'build') {
        return {
          success: true,
          exitCode: 0,
          stdout: 'Build succeeded.\n0 Warning(s)\n0 Error(s)',
          stderr: '',
          timedOut: false,
        };
      }

      if (command === 'dotnet' && args[0] === 'run') {
        return {
          success: true,
          exitCode: 0,
          stdout: 'Game booted successfully',
          stderr: '',
          timedOut: false,
        };
      }

      return {
        success: true,
        exitCode: 0,
        stdout: 'Build succeeded',
        stderr: '',
        timedOut: false,
      };
    });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = createServer();

    registerTestTools(server);

    const allDocs = getAllDocs();
    const docEntries: DocEntry[] = allDocs.map((doc) => ({ ...doc, content: '' }));
    const docSearchEngine = new DocSearchEngine(docEntries);
    registerResources(server, docSearchEngine);
    registerPrompts(server);

    await server.connect(serverTransport);

    client = new Client(
      { name: 'test-client', version: '0.1.0' },
      { capabilities: {} },
    );

    await client.connect(clientTransport);
  });

  afterEach(async () => {
    vi.restoreAllMocks();

    try {
      await client.close();
    } catch {
      // already closed
    }

    try {
      await server.close();
    } catch {
      // already closed
    }

    await rm(tempDir, { recursive: true, force: true });
  });

  describe('Server lifecycle', () => {
    it('initializes and exposes server capabilities', () => {
      const capabilities = client.getServerCapabilities();
      expect(capabilities).toBeDefined();
      expect(capabilities?.tools).toBeDefined();
      expect(capabilities?.resources).toBeDefined();
      expect(capabilities?.prompts).toBeDefined();
    });

    it('lists all 7 tools, all resource types, and all 4 prompts', async () => {
      const tools = await client.listTools();
      const resources = await client.listResources();
      const prompts = await client.listPrompts();

      const toolNames = new Set(tools.tools.map((tool) => tool.name));
      expect(toolNames).toEqual(new Set([
        'monogame_api_lookup',
        'monogame_create_project',
        'monogame_manage_content',
        'monogame_build_content',
        'monogame_scaffold_code',
        'monogame_diagnose_error',
        'monogame_build_run',
      ]));

      const resourceUris = resources.resources.map((resource) => resource.uri);
      expect(resourceUris.some((uri) => uri.startsWith('monogame://api/'))).toBe(true);
      expect(resourceUris.some((uri) => uri.startsWith('monogame://examples/'))).toBe(true);
      expect(resourceUris.some((uri) => uri.startsWith('monogame://content-pipeline/'))).toBe(true);
      expect(resourceUris.some((uri) => uri.startsWith('monogame://platforms/'))).toBe(true);

      const promptNames = prompts.prompts.map((prompt) => prompt.name);
      expect(promptNames).toEqual(expect.arrayContaining([
        'monogame_code_review',
        'monogame_troubleshoot',
        'monogame_architecture',
        'monogame_implement_feature',
      ]));
    });

    it('shuts down cleanly', async () => {
      await expect(client.close()).resolves.toBeUndefined();
      await expect(server.close()).resolves.toBeUndefined();
    });
  });

  describe('Tool integration', () => {
    it('monogame_api_lookup returns SpriteBatch documentation', async () => {
      const result = await client.callTool({
        name: 'monogame_api_lookup',
        arguments: { query: 'SpriteBatch' },
      });

      const text = getText(result);
      expect(result.isError).not.toBe(true);
      expect(text).toContain('SpriteBatch');
    });

    it('monogame_api_lookup handles invalid query with validation message', async () => {
      const result = await client.callTool({
        name: 'monogame_api_lookup',
        arguments: { query: '' },
      });

      expect(result.isError).toBe(true);
      expect(getText(result)).toContain('Validation error');
    });

    it('monogame_diagnose_error diagnoses content file errors', async () => {
      const result = await client.callTool({
        name: 'monogame_diagnose_error',
        arguments: { errorMessage: 'Could not find ContentTypeReader for myasset' },
      });

      const text = getText(result);
      expect(text).toContain('# MonoGame Error Diagnosis');
      expect(text).toContain('Content Loading');
    });

    it('monogame_diagnose_error references content-pipeline docs that map to valid resources', async () => {
      const diagnosis = await client.callTool({
        name: 'monogame_diagnose_error',
        arguments: { errorMessage: 'Could not find ContentTypeReader for asset' },
      });

      const diagnosisText = getText(diagnosis);
      const contentPipelineDocMatch = diagnosisText.match(/file:\/\/src\/docs\/content-pipeline\/([a-z0-9-]+)\.md/i);
      expect(contentPipelineDocMatch).toBeTruthy();

      const resourceUri = `monogame://content-pipeline/${contentPipelineDocMatch?.[1]}`;
      const resource = await client.readResource({ uri: resourceUri });
      expect(getResourceText(resource)).toContain('Content');
    });

    it('monogame_scaffold_code returns game-class C# template', async () => {
      const result = await client.callTool({
        name: 'monogame_scaffold_code',
        arguments: { template: 'game-class' },
      });

      const text = getText(result);
      expect(text).toContain('public class Game1 : Game');
    });

    it('monogame_scaffold_code lists all templates', async () => {
      const result = await client.callTool({
        name: 'monogame_scaffold_code',
        arguments: { template: 'ignored', listTemplates: true },
      });

      const text = getText(result);
      const templateNames = [
        'game-class',
        'drawable-component',
        'game-component',
        'input-handler',
        'sprite-animation',
        'scene-manager',
        'collision-helper',
        'audio-manager',
      ];

      for (const name of templateNames) {
        expect(text).toContain(name);
      }
    });

    it('monogame_scaffold_code returns error message for invalid template', async () => {
      const result = await client.callTool({
        name: 'monogame_scaffold_code',
        arguments: { template: 'not-a-template' },
      });

      expect(getText(result)).toContain('Invalid Template');
    });

    it('monogame_create_project succeeds with mocked subprocess calls', async () => {
      const result = await client.callTool({
        name: 'monogame_create_project',
        arguments: {
          projectName: 'SpaceGame',
          template: 'desktopgl',
          outputDirectory: tempDir,
        },
      });

      expect(result.isError).not.toBe(true);
      expect(getText(result)).toContain('Project created successfully');
    });

    it('monogame_manage_content list action parses mgcb entries', async () => {
      const result = await client.callTool({
        name: 'monogame_manage_content',
        arguments: { action: 'list', mgcbPath },
      });

      const text = getText(result);
      expect(text).toContain('# MGCB Content Entries');
      expect(text).toContain('Sprites/player.png');
    });

    it('monogame_manage_content add action updates mgcb content', async () => {
      await client.callTool({
        name: 'monogame_manage_content',
        arguments: { action: 'add', mgcbPath, assetPath: 'Sprites/enemy.png' },
      });

      const updated = await readFile(mgcbPath, 'utf-8');
      expect(updated).toContain('#begin Sprites/enemy.png');
      expect(updated).toContain('/importer:TextureImporter');
    });

    it('monogame_build_content returns build output with mocked mgcb process', async () => {
      const result = await client.callTool({
        name: 'monogame_build_content',
        arguments: { mgcbPath, platform: 'DesktopGL' },
      });

      expect(result.isError).toBe(false);
      expect(getText(result)).toContain('Build Successful');
      expect(getText(result)).toContain('3 files');
    });

    it('monogame_build_run build action returns build output', async () => {
      const result = await client.callTool({
        name: 'monogame_build_run',
        arguments: { action: 'build', projectPath: './MyGame.csproj' },
      });

      expect(getText(result)).toContain('MonoGame Project Build');
      expect(getText(result)).toContain('**Build Status**: Success');
    });

    it('monogame_build_run run action includes run output', async () => {
      const result = await client.callTool({
        name: 'monogame_build_run',
        arguments: { action: 'run', projectPath: './MyGame.csproj' },
      });

      expect(getText(result)).toContain('MonoGame Project Run');
      expect(getText(result)).toContain('Game booted successfully');
    });
  });

  describe('Resource integration', () => {
    it('reads monogame://api/SpriteBatch', async () => {
      const result = await client.readResource({ uri: 'monogame://api/SpriteBatch' });
      expect(getResourceText(result)).toContain('SpriteBatch');
    });

    it('reads monogame://examples/input-handling', async () => {
      const result = await client.readResource({ uri: 'monogame://examples/input-handling' });
      expect(getResourceText(result)).toContain('Input');
    });

    it('reads monogame://content-pipeline/overview', async () => {
      const result = await client.readResource({ uri: 'monogame://content-pipeline/overview' });
      expect(getResourceText(result)).toContain('Content Pipeline');
    });

    it('reads monogame://platforms/desktopgl', async () => {
      const result = await client.readResource({ uri: 'monogame://platforms/desktopgl' });
      expect(getResourceText(result)).toContain('DesktopGL');
    });
  });

  describe('Prompt integration', () => {
    it('monogame_code_review returns user-role prompt messages with methodology', async () => {
      const result = await client.getPrompt({
        name: 'monogame_code_review',
        arguments: { code: 'public class Game1 : Game {}', focus: 'rendering' },
      });

      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.messages.every((message) => message.role === 'user')).toBe(true);
      expect(result.messages[0].content.type).toBe('text');
      if (result.messages[0].content.type === 'text') {
        expect(result.messages[0].content.text).toContain('SpriteBatch lifecycle');
      }
    });

    it('monogame_troubleshoot includes provided error argument in user message', async () => {
      const result = await client.getPrompt({
        name: 'monogame_troubleshoot',
        arguments: { error: 'ContentLoadException: file not found' },
      });

      expect(result.messages[1].content.type).toBe('text');
      if (result.messages[1].content.type === 'text') {
        expect(result.messages[1].content.text).toContain('ContentLoadException: file not found');
      }
    });

    it('monogame_architecture includes architecture guidance patterns', async () => {
      const result = await client.getPrompt({
        name: 'monogame_architecture',
        arguments: { gameType: 'top-down', scale: 'large' },
      });

      expect(result.messages[0].content.type).toBe('text');
      if (result.messages[0].content.type === 'text') {
        expect(result.messages[0].content.text).toContain('GameComponent System');
        expect(result.messages[0].content.text).toContain('Scene/State Management');
      }
    });

    it('monogame_implement_feature includes requested feature in message', async () => {
      const result = await client.getPrompt({
        name: 'monogame_implement_feature',
        arguments: { feature: 'minimap overlay' },
      });

      expect(result.messages[1].content.type).toBe('text');
      if (result.messages[1].content.type === 'text') {
        expect(result.messages[1].content.text).toContain('minimap overlay');
      }
    });
  });

  describe('Error handling', () => {
    it('returns error for invalid tool name', async () => {
      await expect(
        client.callTool({ name: 'monogame_not_a_real_tool', arguments: {} }),
      ).rejects.toThrow(/Unknown tool/i);
    });

    it('returns zod validation errors for invalid tool arguments', async () => {
      const result = await client.callTool({
        name: 'monogame_create_project',
        arguments: { projectName: 'Bad-Name!', template: 'desktopgl' },
      });

      expect(result.isError).toBe(true);
      expect(getText(result)).toContain('Validation error');
    });

    it('returns error response for invalid resource URI', async () => {
      const result = await client.readResource({ uri: 'monogame://invalid-topic/example' });
      expect(getResourceText(result)).toContain('Unknown resource type');
    });
  });
});
