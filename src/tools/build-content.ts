import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ZodError, z } from 'zod';
import { MonoGamePlatform } from '../types.js';
import { checkPrerequisite, executeCommand } from '../utils/subprocess.js';

const inputSchema = z.object({
  mgcbPath: z.string({ message: 'mgcbPath is required' }).trim().min(1, 'mgcbPath cannot be empty'),
  platform: z.nativeEnum(MonoGamePlatform, { message: 'Invalid platform' }).optional(),
  rebuild: z.boolean().default(false),
  clean: z.boolean().default(false),
});

export const buildContentTool = {
  name: 'monogame_build_content',
  description: 'Build MonoGame content using MGCB CLI',
  inputSchema,
};

/**
 * Parse file count from MGCB stdout
 * Looks for patterns like "Processed 10 files" or "Build 7 files"
 */
function parseFileCount(stdout: string): number | null {
  const processedMatch = /Processed\s+(\d+)\s+files?/i.exec(stdout);
  if (processedMatch) {
    return Number.parseInt(processedMatch[1], 10);
  }

  const buildMatch = /Build\s+(\d+)\s+files?/i.exec(stdout);
  if (buildMatch) {
    return Number.parseInt(buildMatch[1], 10);
  }

  return null;
}

/**
 * Format build success response
 */
function formatSuccess(stdout: string, fileCount: number | null): string {
  let output = '# Build Successful\n\n';

  if (fileCount !== null) {
    output += `Processed **${fileCount} files**.\n\n`;
  } else {
    output += 'Content build completed.\n\n';
  }

  output += '## Build Output\n\n```\n';
  output += stdout.trim();
  output += '\n```';

  return output;
}

/**
 * Format build failure response
 */
function formatFailure(exitCode: number, stdout: string, stderr: string): string {
  let output = '# Build Failed\n\n';
  output += `Exit code: ${exitCode}\n\n`;

  if (stderr.trim().length > 0) {
    output += '## Errors\n\n```\n';
    output += stderr.trim();
    output += '\n```\n\n';
  }

  if (stdout.trim().length > 0) {
    output += '## Build Output\n\n```\n';
    output += stdout.trim();
    output += '\n```';
  }

  return output;
}

/**
 * Format prerequisite missing response
 */
function formatPrerequisiteMissing(): string {
  return [
    '# MGCB Not Installed',
    '',
    'dotnet-mgcb is not installed globally.',
    '',
    '## Installation',
    '',
    'Install the MonoGame Content Builder tool:',
    '',
    '```bash',
    'dotnet tool install -g dotnet-mgcb',
    '```',
    '',
    'Or update it if already installed:',
    '',
    '```bash',
    'dotnet tool update -g dotnet-mgcb',
    '```',
    '',
    '## Verification',
    '',
    'After installation, verify with:',
    '',
    '```bash',
    'mgcb --help',
    '```',
  ].join('\n');
}

export async function handleBuildContent(args: unknown): Promise<CallToolResult> {
  let input: z.infer<typeof inputSchema>;

  try {
    input = inputSchema.parse(args);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Validation error: ${error.issues.map((issue) => issue.message).join('; ')}`,
          },
        ],
      };
    }

    throw error;
  }

  // Check prerequisite: dotnet-mgcb must be installed
  const prerequisite = await checkPrerequisite('dotnet-mgcb');

  if (!prerequisite.available) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: formatPrerequisiteMissing(),
        },
      ],
    };
  }

  // Build command args
  const args_array = [input.mgcbPath];

  if (input.platform) {
    args_array.push(`/platform:${input.platform}`);
  }

  if (input.rebuild) {
    args_array.push('/rebuild');
  }

  if (input.clean) {
    args_array.push('/clean');
  }

  // Execute build command with 120 second timeout
  const result = await executeCommand('mgcb', args_array, {
    timeout: 120000,
  });

  // Handle timeout
  if (result.timedOut) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: [
            '# Build Timeout',
            '',
            'The build process exceeded the 120 second timeout.',
            '',
            '## Suggestions',
            '',
            '1. Check if the .mgcb file contains a large number of assets',
            '2. Try building with `/rebuild` flag to force full rebuild',
            '3. Verify that asset files are not corrupted',
            '4. Check system resources (CPU, memory)',
          ].join('\n'),
        },
      ],
    };
  }

  // Handle build failure
  if (result.exitCode !== 0) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: formatFailure(result.exitCode, result.stdout, result.stderr),
        },
      ],
    };
  }

  // Parse file count from output
  const fileCount = parseFileCount(result.stdout);

  // Return success
  return {
    isError: false,
    content: [
      {
        type: 'text',
        text: formatSuccess(result.stdout, fileCount),
      },
    ],
  };
}
