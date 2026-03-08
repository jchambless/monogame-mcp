import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

describe('Packaging', () => {
  describe('package.json configuration', () => {
    it('should have all required production fields', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      expect(packageJson).toHaveProperty('name', 'monogame-mcp');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('description');
      expect(packageJson).toHaveProperty('main', './build/index.js');
      expect(packageJson).toHaveProperty('types', './build/index.d.ts');
      expect(packageJson).toHaveProperty('bin');
      expect(packageJson).toHaveProperty('files');
      expect(packageJson).toHaveProperty('scripts');
      expect(packageJson).toHaveProperty('engines');
      expect(packageJson).toHaveProperty('license');
    });

    it('should have bin entry pointing to build/index.js', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      expect(packageJson.bin).toEqual({
        'monogame-mcp': './build/index.js'
      });
    });

    it('should have files field including build and docs', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      expect(packageJson.files).toContain('build');
      expect(Array.isArray(packageJson.files)).toBe(true);
      expect(packageJson.files.length).toBeGreaterThan(0);
    });

    it('should have Node >= 18 engine requirement', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      expect(packageJson.engines.node).toMatch(/>=\s*18/);
    });

    it('should have prepublishOnly script', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      expect(packageJson.scripts).toHaveProperty('prepublishOnly');
      expect(packageJson.scripts.prepublishOnly).toContain('build');
    });
  });

  describe('build output', () => {
    beforeAll(() => {
      // Run build
      execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    });

    it('should compile to build/index.js', () => {
      const buildFile = path.join(PROJECT_ROOT, 'build', 'index.js');
      expect(fs.existsSync(buildFile)).toBe(true);
    });

    it('should compile to build/index.d.ts', () => {
      const defsFile = path.join(PROJECT_ROOT, 'build', 'index.d.ts');
      expect(fs.existsSync(defsFile)).toBe(true);
    });

    it('should preserve shebang in build/index.js', () => {
      const buildFile = path.join(PROJECT_ROOT, 'build', 'index.js');
      const content = fs.readFileSync(buildFile, 'utf-8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should have executable permissions shebang for cli use', () => {
      const buildFile = path.join(PROJECT_ROOT, 'build', 'index.js');
      const content = fs.readFileSync(buildFile, 'utf-8');
      const firstLine = content.split('\n')[0];
      expect(firstLine).toBe('#!/usr/bin/env node');
    });
  });

  describe('npm pack dry-run', () => {
    it('should list correct files in package', () => {
      const output = execSync('npm pack --dry-run 2>&1', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        shell: 'cmd.exe'
      });

      // npm pack --dry-run shows tarball contents via npm notice
      expect(output).toContain('build/index.js');
      expect(output).toContain('src/docs');
    });

    it('should exclude test files', () => {
      const output = execSync('npm pack --dry-run', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      expect(output).not.toContain('tests/');
      expect(output).not.toContain('.test.ts');
    });

    it('should exclude .sisyphus directory', () => {
      const output = execSync('npm pack --dry-run', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      expect(output).not.toContain('.sisyphus');
    });

    it('should be under 5MB', () => {
      const output = execSync('npm pack --dry-run', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      // Extract size from npm pack output
      const sizeMatch = output.match(/(\d+(?:\.\d+)?)\s*[KMG]?B/);
      if (sizeMatch) {
        let size = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[0].replace(/[\d.]/g, '').trim();

        if (unit === 'KB' || unit === 'K') {
          size = size / 1024;
        } else if (unit === 'MB' || unit === 'M') {
          // Already in MB
        } else if (unit === 'B') {
          size = size / (1024 * 1024);
        }

        expect(size).toBeLessThan(5);
      }
    });
  });

  describe('npmignore configuration', () => {
    it('should create .npmignore if needed', () => {
      const npmignorePath = path.join(PROJECT_ROOT, '.npmignore');
      // Check if .npmignore exists or if .gitignore is sufficient
      const hasNpmignore = fs.existsSync(npmignorePath);
      const hasGitignore = fs.existsSync(path.join(PROJECT_ROOT, '.gitignore'));

      expect(hasNpmignore || hasGitignore).toBe(true);
    });
  });

  describe('package completeness', () => {
    it('should have valid package.json that can be parsed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
    });

    it('should not include source TypeScript files in package', () => {
      const output = execSync('npm pack --dry-run', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8'
      });

      // Should not have src/ in file list (only build/)
      const lines = output.split('\n');
      const hasSourceTs = lines.some(line => 
        line.includes('src/') && line.includes('.ts') && !line.includes('src/docs')
      );
      expect(hasSourceTs).toBe(false);
    });
  });
});
