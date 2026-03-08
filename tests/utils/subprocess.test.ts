import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const spawnMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}));

type MockChild = EventEmitter & {
  stdout: EventEmitter;
  stderr: EventEmitter;
  kill: ReturnType<typeof vi.fn>;
};

function createMockChild(): MockChild {
  const child = new EventEmitter() as MockChild;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = vi.fn(() => {
    child.emit('close', null, 'SIGTERM');
    return true;
  });
  return child;
}

describe('subprocess utility', () => {
  beforeEach(() => {
    spawnMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes an allowlisted command with safe spawn options', async () => {
    const child = createMockChild();
    spawnMock.mockReturnValue(child);

    const { executeCommand } = await import('../../src/utils/subprocess.js');
    const resultPromise = executeCommand('dotnet', ['--version']);

    await vi.waitFor(() => {
      expect(spawnMock).toHaveBeenCalledTimes(1);
    });

    child.stdout.emit('data', Buffer.from('8.0.100\n'));
    child.emit('close', 0, null);

    const result = await resultPromise;

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('8.0.100');
    expect(result.stderr).toBe('');
    expect(result.timedOut).toBe(false);
    expect(spawnMock).toHaveBeenCalledWith(
      'dotnet',
      ['--version'],
      expect.objectContaining({
        shell: false,
        cwd: process.cwd(),
      }),
    );
  });

  it('rejects commands not present in the allowlist', async () => {
    const { executeCommand } = await import('../../src/utils/subprocess.js');

    await expect(executeCommand('node', ['--version'])).rejects.toThrow(
      'Command not allowed: node',
    );
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('rejects arguments containing shell metacharacters', async () => {
    const { executeCommand } = await import('../../src/utils/subprocess.js');

    await expect(executeCommand('dotnet', ['new; rm -rf /'])).rejects.toThrow(
      'Argument contains dangerous character: ;',
    );
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('marks result as timed out when process exceeds timeout', async () => {
    vi.useFakeTimers();

    const child = createMockChild();
    spawnMock.mockReturnValue(child);

    const { executeCommand } = await import('../../src/utils/subprocess.js');
    const resultPromise = executeCommand('dotnet', ['--info'], { timeout: 25 });

    await vi.waitFor(() => {
      expect(spawnMock).toHaveBeenCalledTimes(1);
    });

    await vi.advanceTimersByTimeAsync(30);
    const result = await resultPromise;

    expect(child.kill).toHaveBeenCalled();
    expect(result.timedOut).toBe(true);
    expect(result.exitCode).toBe(-1);
  });

  it('captures non-zero exit code and stderr output', async () => {
    const child = createMockChild();
    spawnMock.mockReturnValue(child);

    const { executeCommand } = await import('../../src/utils/subprocess.js');
    const resultPromise = executeCommand('dotnet', ['build']);

    await vi.waitFor(() => {
      expect(spawnMock).toHaveBeenCalledTimes(1);
    });

    child.stderr.emit('data', Buffer.from('build failed'));
    child.emit('close', 1, null);

    const result = await resultPromise;

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('build failed');
    expect(result.timedOut).toBe(false);
  });

  it('throws when cwd does not exist', async () => {
    const { executeCommand } = await import('../../src/utils/subprocess.js');

    await expect(
      executeCommand('dotnet', ['--version'], {
        cwd: 'C:/__missing__/__directory__',
      }),
    ).rejects.toThrow('Working directory does not exist');
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('truncates stdout and stderr to one megabyte each', async () => {
    const child = createMockChild();
    spawnMock.mockReturnValue(child);

    const { executeCommand } = await import('../../src/utils/subprocess.js');
    const resultPromise = executeCommand('dotnet', ['--version']);

    await vi.waitFor(() => {
      expect(spawnMock).toHaveBeenCalledTimes(1);
    });

    const oversized = 'x'.repeat(1_048_600);
    child.stdout.emit('data', Buffer.from(oversized));
    child.stderr.emit('data', Buffer.from(oversized));
    child.emit('close', 0, null);

    const result = await resultPromise;

    expect(result.stdout.length).toBe(1_048_576);
    expect(result.stderr.length).toBe(1_048_576);
  });

  it('checkPrerequisite returns unavailable for unknown command', async () => {
    const { checkPrerequisite } = await import('../../src/utils/subprocess.js');

    const result = await checkPrerequisite('unknown-tool');
    expect(result.available).toBe(false);
    expect(result.message).toContain('Unknown prerequisite: unknown-tool');
  });
});
