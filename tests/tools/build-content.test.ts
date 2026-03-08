import { describe, expect, it, vi } from 'vitest';
import type { SubprocessResult } from '../../src/types.js';

// Mock subprocess module
vi.mock('../../src/utils/subprocess.js', () => ({
  executeCommand: vi.fn(),
  checkPrerequisite: vi.fn(),
}));

// Import AFTER mocking
const { handleBuildContent } = await import('../../src/tools/build-content.js');
const { executeCommand, checkPrerequisite } = await import('../../src/utils/subprocess.js');

describe('handleBuildContent', () => {
  it('should return install instructions when dotnet-mgcb is not available', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: false,
      message: 'dotnet-mgcb is not installed globally',
    });

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('dotnet-mgcb is not installed');
    expect(result.content[0].text).toContain('dotnet tool install -g dotnet-mgcb');
  });

  it('should build successfully with minimal arguments (mgcbPath only)', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 0,
      stdout: 'Building Content...\nProcessed 5 files successfully.',
      stderr: '',
      timedOut: false,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Build Successful');
    expect(result.content[0].text).toContain('5 files');
    expect(executeCommand).toHaveBeenCalledWith('mgcb', ['Content/Content.mgcb'], expect.any(Object));
  });

  it('should include platform flag when platform is specified', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 0,
      stdout: 'Building Content...\nProcessed 3 files successfully.',
      stderr: '',
      timedOut: false,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
      platform: 'DesktopGL',
    });

    expect(result.isError).toBe(false);
    expect(executeCommand).toHaveBeenCalledWith(
      'mgcb',
      ['Content/Content.mgcb', '/platform:DesktopGL'],
      expect.any(Object)
    );
  });

  it('should include rebuild flag when rebuild is true', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 0,
      stdout: 'Rebuilding Content...\nProcessed 8 files successfully.',
      stderr: '',
      timedOut: false,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
      rebuild: true,
    });

    expect(result.isError).toBe(false);
    expect(executeCommand).toHaveBeenCalledWith(
      'mgcb',
      ['Content/Content.mgcb', '/rebuild'],
      expect.any(Object)
    );
  });

  it('should include clean flag when clean is true', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 0,
      stdout: 'Cleaning and building Content...\nProcessed 6 files successfully.',
      stderr: '',
      timedOut: false,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
      clean: true,
    });

    expect(result.isError).toBe(false);
    expect(executeCommand).toHaveBeenCalledWith(
      'mgcb',
      ['Content/Content.mgcb', '/clean'],
      expect.any(Object)
    );
  });

  it('should combine all flags when all options are specified', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 0,
      stdout: 'Building Content for WindowsDX...\nProcessed 12 files successfully.',
      stderr: '',
      timedOut: false,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
      platform: 'WindowsDX',
      rebuild: true,
      clean: true,
    });

    expect(result.isError).toBe(false);
    expect(executeCommand).toHaveBeenCalledWith(
      'mgcb',
      ['Content/Content.mgcb', '/platform:WindowsDX', '/rebuild', '/clean'],
      expect.any(Object)
    );
  });

  it('should return error details when build fails', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 1,
      stdout: 'Building Content...\nProcessed 2 files.',
      stderr: 'Error: Could not find importer for texture.png\nBuild failed with 1 error(s).',
      timedOut: false,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Build Failed');
    expect(result.content[0].text).toContain('Could not find importer');
    expect(result.content[0].text).toContain('Exit code: 1');
  });

  it('should handle timeout during build', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: -1,
      stdout: 'Building Content...',
      stderr: '',
      timedOut: true,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Build Timeout');
    expect(result.content[0].text).toContain('120 second timeout');
  });

  it('should use 120 second timeout for long builds', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 0,
      stdout: 'Building Content...\nProcessed 50 files successfully.',
      stderr: '',
      timedOut: false,
    } as SubprocessResult);

    await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
    });

    expect(executeCommand).toHaveBeenCalledWith(
      'mgcb',
      ['Content/Content.mgcb'],
      expect.objectContaining({ timeout: 120000 })
    );
  });

  it('should reject invalid platform values', async () => {
    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
      platform: 'InvalidPlatform',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Validation error');
  });

  it('should reject missing mgcbPath', async () => {
    const result = await handleBuildContent({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Validation error');
  });

  it('should parse file count from stdout', async () => {
    vi.mocked(checkPrerequisite).mockResolvedValue({
      available: true,
      version: 'installed',
      message: 'dotnet-mgcb is available',
    });

    vi.mocked(executeCommand).mockResolvedValue({
      exitCode: 0,
      stdout: 'Building Content...\nSkip 3 files.\nBuild 7 files.\nProcessed 10 files successfully.',
      stderr: '',
      timedOut: false,
    } as SubprocessResult);

    const result = await handleBuildContent({
      mgcbPath: 'Content/Content.mgcb',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('10 files');
  });
});
