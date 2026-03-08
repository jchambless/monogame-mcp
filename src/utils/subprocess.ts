import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import type { SubprocessOptions, SubprocessResult } from '../types.js';

const ALLOWED_COMMANDS = new Set(['dotnet', 'mgcb', 'dotnet-mgcb']);
const DANGEROUS_CHARS = [';', '|', '&', '$', '`', '\n'];
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_BYTES = 1_048_576;

function validateCommand(command: string): void {
  if (!ALLOWED_COMMANDS.has(command)) {
    throw new Error(`Command not allowed: ${command}`);
  }
}

function sanitizeArgs(args: string[]): void {
  for (const arg of args) {
    for (const dangerousChar of DANGEROUS_CHARS) {
      if (arg.includes(dangerousChar)) {
        throw new Error(`Argument contains dangerous character: ${dangerousChar}`);
      }
    }
  }
}

async function validateCwd(cwd: string): Promise<void> {
  let stats;

  try {
    stats = await fs.stat(cwd);
  } catch {
    throw new Error('Working directory does not exist');
  }

  if (!stats.isDirectory()) {
    throw new Error('Working directory is not a directory');
  }
}

function normalizeTimeout(timeout?: number): number {
  if (typeof timeout !== 'number' || !Number.isFinite(timeout) || timeout <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.min(Math.floor(timeout), MAX_TIMEOUT_MS);
}

function appendWithLimit(current: string, chunk: Buffer | string): string {
  if (current.length >= MAX_OUTPUT_BYTES) {
    return current;
  }

  const next = current + chunk.toString();

  if (next.length > MAX_OUTPUT_BYTES) {
    return next.slice(0, MAX_OUTPUT_BYTES);
  }

  return next;
}

export async function executeCommand(
  command: string,
  args: string[],
  options?: SubprocessOptions,
): Promise<SubprocessResult> {
  validateCommand(command);
  sanitizeArgs(args);

  const cwd = options?.cwd ?? process.cwd();
  await validateCwd(cwd);

  const timeout = normalizeTimeout(options?.timeout);
  const env = {
    ...process.env,
    ...(options?.env ?? {}),
  };

  return await new Promise<SubprocessResult>((resolve) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      timeout,
      env,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeout);

    const finish = (result: SubprocessResult): void => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutHandle);
      resolve(result);
    };

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout = appendWithLimit(stdout, chunk);
    });

    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr = appendWithLimit(stderr, chunk);
    });

    child.on('error', (error: Error) => {
      finish({
        exitCode: -1,
        stdout,
        stderr: appendWithLimit(stderr, error.message),
        timedOut,
      });
    });

    child.on('close', (exitCode: number | null, signal: NodeJS.Signals | null) => {
      const didTimeout = timedOut || signal === 'SIGTERM' || signal === 'SIGKILL';

      finish({
        exitCode: didTimeout && exitCode === null ? -1 : (exitCode ?? -1),
        stdout,
        stderr,
        timedOut: didTimeout,
      });
    });
  });
}

export async function checkPrerequisite(
  command: string,
): Promise<{ available: boolean; version?: string; message: string }> {
  if (!ALLOWED_COMMANDS.has(command)) {
    return { available: false, message: `Unknown prerequisite: ${command}` };
  }

  if (command === 'dotnet') {
    const result = await executeCommand('dotnet', ['--version']);

    if (result.exitCode === 0 && result.stdout.trim().length > 0) {
      const version = result.stdout.trim();
      return {
        available: true,
        version,
        message: `dotnet is available (${version})`,
      };
    }

    return {
      available: false,
      message: result.stderr.trim() || 'dotnet is not available',
    };
  }

  const toolList = await executeCommand('dotnet', ['tool', 'list', '-g']);

  if (toolList.exitCode !== 0) {
    return {
      available: false,
      message: toolList.stderr.trim() || 'Unable to query global dotnet tools',
    };
  }

  const hasMgcb = /dotnet-mgcb/i.test(toolList.stdout);
  if (!hasMgcb) {
    return {
      available: false,
      message: 'dotnet-mgcb is not installed globally',
    };
  }

  return {
    available: true,
    version: 'installed',
    message: 'dotnet-mgcb is available',
  };
}
