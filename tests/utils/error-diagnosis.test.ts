import { describe, expect, it } from 'vitest';
import { diagnoseError, listErrorPatterns } from '../../src/utils/error-diagnosis.js';

describe('error-diagnosis utility', () => {
  describe('diagnoseError', () => {
    it('diagnoses "Content file not found" error', () => {
      const error = 'Microsoft.Xna.Framework.Content.ContentLoadException: Could not find ContentTypeReader for Textures/player';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Content Loading');
      expect(diagnosis?.cause).toBeTruthy();
      expect(diagnosis?.solution).toBeInstanceOf(Array);
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
      expect(diagnosis?.docLinks).toBeInstanceOf(Array);
      expect(diagnosis?.docLinks.length).toBeGreaterThan(0);
    });

    it('diagnoses "Begin must be called before Draw" error', () => {
      const error = 'InvalidOperationException: Begin must be called before Draw can be called.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Graphics Lifecycle');
      expect(diagnosis?.pattern).toContain('SpriteBatch');
      expect(diagnosis?.cause).toBeTruthy();
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
    });

    it('diagnoses "End must be called before Begin" error', () => {
      const error = 'InvalidOperationException: End must be called before Begin can be called again.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Graphics Lifecycle');
      expect(diagnosis?.cause).toBeTruthy();
    });

    it('diagnoses "GraphicsDevice must not be null" error', () => {
      const error = 'NullReferenceException: The GraphicsDevice must not be null when creating new resources.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Graphics Initialization');
      expect(diagnosis?.cause).toContain('GraphicsDevice');
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
      expect(diagnosis?.docLinks.some(link => link.includes('graphicsdevice'))).toBe(true);
    });

    it('diagnoses "No suitable graphics card found" error', () => {
      const error = 'NoSuitableGraphicsDeviceException: No suitable graphics card found. Could not find a Direct3D device that supports the XNA Framework HiDef profile.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Graphics Hardware');
      expect(diagnosis?.cause).toContain('GPU');
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
    });

    it('diagnoses "Could not load asset" error', () => {
      const error = 'ContentLoadException: Could not load music asset as a non-content file.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Content Loading');
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
      expect(diagnosis?.docLinks.some(link => link.includes('content-pipeline'))).toBe(true);
    });

    it('diagnoses "Effect compilation failed" error', () => {
      const error = 'error MGCB: Failed to build Shaders/custom.fx: Effect compilation failed - Syntax error: unexpected token';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Shader Compilation');
      expect(diagnosis?.cause).toContain('shader');
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
    });

    it('diagnoses "Cannot access a disposed object" error', () => {
      const error = 'ObjectDisposedException: Cannot access a disposed object. Object name: Texture2D.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Object Lifecycle');
      expect(diagnosis?.cause).toContain('disposed');
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
    });

    it('diagnoses "Content importer could not be found" error', () => {
      const error = 'error MGCB: The content importer TextureImporter could not be found. Make sure the importer is installed and available.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Content Pipeline');
      expect(diagnosis?.cause).toContain('importer');
      expect(diagnosis?.docLinks.some(link => link.includes('troubleshooting'))).toBe(true);
    });

    it('diagnoses "dotnet new: Could not find template" error', () => {
      const error = 'No templates or subcommands found matching: mgdesktopgl.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Project Setup');
      expect(diagnosis?.cause).toContain('template');
      expect(diagnosis?.solution.some(s => s.includes('dotnet new install'))).toBe(true);
    });

    it('returns null for unknown error messages', () => {
      const error = 'This is some completely random error that does not match any pattern xyz123';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).toBeNull();
    });

    it('all diagnoses include cause, solution steps, and at least one doc link', () => {
      const testErrors = [
        'ContentLoadException: Could not find ContentTypeReader',
        'InvalidOperationException: Begin must be called before Draw',
        'NullReferenceException: The GraphicsDevice must not be null',
        'error MGCB: Effect compilation failed',
        'ObjectDisposedException: Cannot access a disposed object',
      ];

      testErrors.forEach((error) => {
        const diagnosis = diagnoseError(error);
        expect(diagnosis).not.toBeNull();
        expect(diagnosis?.cause).toBeTruthy();
        expect(diagnosis?.cause.length).toBeGreaterThan(0);
        expect(diagnosis?.solution).toBeInstanceOf(Array);
        expect(diagnosis?.solution.length).toBeGreaterThan(0);
        expect(diagnosis?.docLinks).toBeInstanceOf(Array);
        expect(diagnosis?.docLinks.length).toBeGreaterThan(0);
      });
    });

    it('diagnoses "Index was outside the bounds of the array" error', () => {
      const error = 'IndexOutOfRangeException: Index was outside the bounds of the array.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Array Access');
      expect(diagnosis?.cause).toBeTruthy();
    });

    it('diagnoses "Content processor could not be found" error', () => {
      const error = 'error MGCB: The content processor TextureProcessor could not be found.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Content Pipeline');
      expect(diagnosis?.cause).toContain('processor');
    });

    it('diagnoses "Texture format not supported" error', () => {
      const error = 'error MGCB: Texture format Dxt5 is not supported on this platform.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Texture Format');
      expect(diagnosis?.solution.some(s => s.includes('TextureFormat'))).toBe(true);
    });

    it('diagnoses "SoundEffect.Play failed" error', () => {
      const error = 'NoAudioHardwareException: SoundEffect.Play failed. No audio hardware available.';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBe('Audio');
      expect(diagnosis?.cause).toContain('audio');
    });

    it('diagnoses "Object reference not set" in game loop error', () => {
      const error = 'NullReferenceException: Object reference not set to an instance of an object at Game.Update';
      const diagnosis = diagnoseError(error);

      expect(diagnosis).not.toBeNull();
      expect(diagnosis?.errorType).toBeTruthy();
      expect(diagnosis?.solution.length).toBeGreaterThan(0);
    });
  });

  describe('listErrorPatterns', () => {
    it('returns at least 15 error patterns', () => {
      const patterns = listErrorPatterns();

      expect(patterns).toBeInstanceOf(Array);
      expect(patterns.length).toBeGreaterThanOrEqual(15);
    });

    it('each pattern has required fields', () => {
      const patterns = listErrorPatterns();

      patterns.forEach((pattern) => {
        expect(pattern.regex).toBeInstanceOf(RegExp);
        expect(pattern.errorType).toBeTruthy();
        expect(pattern.description).toBeTruthy();
        expect(pattern.cause).toBeTruthy();
        expect(pattern.solution).toBeTruthy();
        expect(pattern.docLinks).toBeInstanceOf(Array);
        expect(pattern.docLinks.length).toBeGreaterThan(0);
      });
    });

    it('patterns have unique descriptions', () => {
      const patterns = listErrorPatterns();
      const descriptions = patterns.map(p => p.description);
      const uniqueDescriptions = new Set(descriptions);

      expect(uniqueDescriptions.size).toBe(descriptions.length);
    });
  });
});
