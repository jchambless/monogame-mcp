/**
 * Tests for Error Diagnosis Tool
 * Tests the monogame_diagnose_error MCP tool handler
 */

import { describe, it, expect } from 'vitest';
import { handleDiagnoseError } from '../../src/tools/diagnose-error.js';

describe('Error Diagnosis Tool', () => {
  describe('Known Errors', () => {
    it('should diagnose content file not found error', async () => {
      const result = await handleDiagnoseError({
        errorMessage: 'Could not find ContentFile "myasset.png"',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const text = result.content[0].text;

      // Verify structured diagnosis format
      expect(text).toContain('# MonoGame Error Diagnosis');
      expect(text).toContain('## Error Identified');
      expect(text).toContain('## Likely Cause');
      expect(text).toContain('## Solution');
      expect(text).toContain('## Related Documentation');

      // Verify specific diagnosis content
      expect(text).toContain('Content Loading');
      expect(text).toContain('Content.RootDirectory');
      expect(text).toMatch(/1\./); // Numbered solution steps
    });

    it('should diagnose SpriteBatch Begin/Draw lifecycle error', async () => {
      const result = await handleDiagnoseError({
        errorMessage: 'Begin must be called before Draw',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const text = result.content[0].text;

      // Verify structured diagnosis
      expect(text).toContain('# MonoGame Error Diagnosis');
      expect(text).toContain('Graphics Lifecycle');
      expect(text).toContain('SpriteBatch.Begin()');
      expect(text).toContain('## Solution');
      expect(text).toMatch(/1\./); // Numbered steps
      expect(text).toContain('## Related Documentation');
    });

    it('should include context in diagnosis when provided', async () => {
      const result = await handleDiagnoseError({
        errorMessage: 'Could not find asset "texture"',
        context: 'Loading game sprites during initialization',
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;

      // Verify context section appears
      expect(text).toContain('## Context');
      expect(text).toContain('Loading game sprites during initialization');
      expect(text).toContain('Content Loading'); // Still has diagnosis
    });
  });

  describe('Unknown Errors', () => {
    it('should provide general troubleshooting for unknown errors', async () => {
      const result = await handleDiagnoseError({
        errorMessage: 'SomeRandomException: mysterious error occurred',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const text = result.content[0].text;

      // Verify general troubleshooting format
      expect(text).toContain('# MonoGame Error Troubleshooting');
      expect(text).toContain('## Error Message');
      expect(text).toContain('SomeRandomException');
      expect(text).toContain('## General Troubleshooting Steps');

      // Verify not empty
      expect(text.length).toBeGreaterThan(100);

      // Verify includes helpful generic advice
      expect(text).toContain('Content.RootDirectory');
      expect(text).toContain('## Additional Resources');
      expect(text).toContain('community.monogame.net');
    });

    it('should include context in unknown error response', async () => {
      const result = await handleDiagnoseError({
        errorMessage: 'UnknownError: something went wrong',
        context: 'Running game on Linux platform',
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;

      // Verify context section
      expect(text).toContain('## Context');
      expect(text).toContain('Running game on Linux platform');
      expect(text).toContain('## General Troubleshooting Steps');
    });
  });

  describe('Input Validation', () => {
    it('should reject empty error message', async () => {
      await expect(
        handleDiagnoseError({ errorMessage: '' })
      ).rejects.toThrow();
    });

    it('should reject missing error message', async () => {
      await expect(handleDiagnoseError({})).rejects.toThrow();
    });

    it('should accept valid error message without context', async () => {
      const result = await handleDiagnoseError({
        errorMessage: 'Some error occurred',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });
  });
});
