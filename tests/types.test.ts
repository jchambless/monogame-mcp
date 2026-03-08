import { describe, it, expect } from 'vitest';
import {
  MonoGameNamespace,
  DocEntry,
  DocSearchResult,
  ToolResult,
  SubprocessResult,
  SubprocessOptions,
  MgcbEntry,
  MgcbProject,
  ErrorPattern,
  ScaffoldTemplate,
  MonoGamePlatform,
  MonoGameTemplate,
} from '../src/types.js';

describe('MonoGame Types', () => {
  describe('MonoGameNamespace enum', () => {
    it('should export MonoGameNamespace enum with correct values', () => {
      expect(MonoGameNamespace.Framework).toBe('Microsoft.Xna.Framework');
      expect(MonoGameNamespace.Audio).toBe('Microsoft.Xna.Framework.Audio');
      expect(MonoGameNamespace.Content).toBe('Microsoft.Xna.Framework.Content');
      expect(MonoGameNamespace.Graphics).toBe('Microsoft.Xna.Framework.Graphics');
      expect(MonoGameNamespace.Input).toBe('Microsoft.Xna.Framework.Input');
      expect(MonoGameNamespace.Media).toBe('Microsoft.Xna.Framework.Media');
    });
  });

  describe('DocEntry interface', () => {
    it('should compile with valid DocEntry object', () => {
      const entry: DocEntry = {
        path: '/docs/graphics/spritebatch',
        title: 'SpriteBatch Documentation',
        namespace: MonoGameNamespace.Graphics,
        category: 'graphics',
        keywords: ['sprite', 'batch', 'drawing'],
        content: 'SpriteBatch is used for drawing 2D sprites...',
      };
      expect(entry.path).toBe('/docs/graphics/spritebatch');
      expect(entry.keywords).toHaveLength(3);
    });

    it('should allow DocEntry without namespace', () => {
      const entry: DocEntry = {
        path: '/docs/overview',
        title: 'Overview',
        category: 'general',
        keywords: ['overview'],
        content: 'MonoGame overview...',
      };
      expect(entry.namespace).toBeUndefined();
    });
  });

  describe('DocSearchResult interface', () => {
    it('should compile with valid DocSearchResult', () => {
      const result: DocSearchResult = {
        entry: {
          path: '/docs/graphics',
          title: 'Graphics',
          category: 'graphics',
          keywords: ['graphics'],
          content: 'Graphics content...',
        },
        relevanceScore: 0.95,
        matchedSection: 'SpriteBatch',
      };
      expect(result.relevanceScore).toBe(0.95);
    });

    it('should allow DocSearchResult without matchedSection', () => {
      const result: DocSearchResult = {
        entry: {
          path: '/docs/test',
          title: 'Test',
          category: 'test',
          keywords: [],
          content: 'Test content',
        },
        relevanceScore: 0.5,
      };
      expect(result.matchedSection).toBeUndefined();
    });
  });

  describe('ToolResult interface', () => {
    it('should compile with text content', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Hello, World!',
          },
        ],
      };
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should compile with image content', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'image',
            data: 'base64encodeddata',
            mimeType: 'image/png',
          },
        ],
        isError: false,
      };
      expect(result.isError).toBe(false);
    });

    it('should compile with error flag', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Error occurred',
          },
        ],
        isError: true,
      };
      expect(result.isError).toBe(true);
    });
  });

  describe('SubprocessResult interface', () => {
    it('should compile with valid subprocess result', () => {
      const result: SubprocessResult = {
        exitCode: 0,
        stdout: 'Success output',
        stderr: '',
        timedOut: false,
      };
      expect(result.exitCode).toBe(0);
      expect(result.timedOut).toBe(false);
    });

    it('should compile with error exit code', () => {
      const result: SubprocessResult = {
        exitCode: 1,
        stdout: '',
        stderr: 'Error message',
        timedOut: false,
      };
      expect(result.exitCode).toBe(1);
    });

    it('should compile with timeout flag', () => {
      const result: SubprocessResult = {
        exitCode: -1,
        stdout: '',
        stderr: 'Process timeout',
        timedOut: true,
      };
      expect(result.timedOut).toBe(true);
    });
  });

  describe('SubprocessOptions interface', () => {
    it('should compile with all options', () => {
      const opts: SubprocessOptions = {
        cwd: '/home/user',
        timeout: 5000,
        env: { PATH: '/usr/bin', NODE_ENV: 'test' },
        args: ['--help'],
      };
      expect(opts.cwd).toBe('/home/user');
      expect(opts.timeout).toBe(5000);
    });

    it('should compile with minimal options', () => {
      const opts: SubprocessOptions = {};
      expect(opts.cwd).toBeUndefined();
    });
  });

  describe('MgcbEntry interface', () => {
    it('should compile with valid MGCB entry', () => {
      const entry: MgcbEntry = {
        path: 'Assets/Textures/sprite.png',
        importer: 'TextureImporter',
        processor: 'TextureProcessor',
        processorParams: {
          ColorKeyEnabled: 'False',
          TextureFormat: 'Color',
        },
        buildAction: 'Build',
      };
      expect(entry.path).toBe('Assets/Textures/sprite.png');
      expect(entry.processorParams.TextureFormat).toBe('Color');
    });
  });

  describe('MgcbProject interface', () => {
    it('should compile with valid MGCB project', () => {
      const project: MgcbProject = {
        outputDir: 'bin/Content',
        intermediateDir: 'obj/Content',
        platform: 'DesktopGL',
        references: [],
        entries: [
          {
            path: 'Assets/Textures/sprite.png',
            importer: 'TextureImporter',
            processor: 'TextureProcessor',
            processorParams: {},
            buildAction: 'Build',
          },
        ],
      };
      expect(project.outputDir).toBe('bin/Content');
      expect(project.entries).toHaveLength(1);
    });

    it('should compile with multiple references and entries', () => {
      const project: MgcbProject = {
        outputDir: 'bin',
        intermediateDir: 'obj',
        platform: 'WindowsDX',
        references: ['lib1.dll', 'lib2.dll'],
        entries: [],
      };
      expect(project.references).toHaveLength(2);
    });
  });

  describe('ErrorPattern interface', () => {
    it('should compile with valid error pattern', () => {
      const pattern: ErrorPattern = {
        regex: /cannot find type/i,
        errorType: 'CompilationError',
        description: 'Type not found in current scope',
        cause: 'Missing using statement or incorrect namespace',
        solution: 'Add appropriate using statement or check namespace',
        docLinks: ['https://docs.monogame.io/'],
      };
      expect(pattern.errorType).toBe('CompilationError');
      expect(pattern.docLinks).toHaveLength(1);
    });
  });

  describe('ScaffoldTemplate interface', () => {
    it('should compile with valid scaffold template', () => {
      const template: ScaffoldTemplate = {
        name: 'simple-game',
        description: 'Simple game starter template',
        category: 'game',
        template: `
          public class {{ClassName}} : Game {
            public {{ClassName}}() { }
            protected override void Draw(GameTime gameTime) { }
          }
        `,
        parameters: ['ClassName', 'Namespace'],
      };
      expect(template.name).toBe('simple-game');
      expect(template.parameters).toHaveLength(2);
    });
  });

  describe('MonoGamePlatform enum', () => {
    it('should export MonoGamePlatform enum with correct values', () => {
      expect(MonoGamePlatform.DesktopGL).toBe('DesktopGL');
      expect(MonoGamePlatform.WindowsDX).toBe('WindowsDX');
      expect(MonoGamePlatform.Android).toBe('Android');
      expect(MonoGamePlatform.iOS).toBe('iOS');
    });
  });

  describe('MonoGameTemplate enum', () => {
    it('should export MonoGameTemplate enum with correct dotnet template names', () => {
      expect(MonoGameTemplate.DesktopGL).toBe('mgdesktopgl');
      expect(MonoGameTemplate.WindowsDX).toBe('mgwindowsdx');
      expect(MonoGameTemplate.Android).toBe('mgandroid');
      expect(MonoGameTemplate.iOS).toBe('mgios');
      expect(MonoGameTemplate.Shared).toBe('mgshared');
    });
  });

  describe('Type import validation', () => {
    it('should have all types exported', () => {
      expect(MonoGameNamespace).toBeDefined();
      expect(MonoGamePlatform).toBeDefined();
      expect(MonoGameTemplate).toBeDefined();
    });
  });
});
