/**
 * MonoGame Build and Run Project Tool (Task 16)
 * 
 * MCP tool that builds or runs MonoGame projects using dotnet CLI.
 * Supports build and run actions with configuration options.
 * 
 * @module tools/build-run
 */

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeCommand, checkPrerequisite } from '../utils/subprocess.js';

/**
 * Input schema for monogame_build_run tool
 */
const inputSchema = z.object({
  action: z.enum(['build', 'run'], { 
    message: 'Action must be either "build" or "run"' 
  }),
  projectPath: z.string().min(1, 'Project path is required'),
  configuration: z.enum(['Debug', 'Release']).default('Debug'),
  restore: z.boolean().default(true)
});

type BuildRunInput = z.infer<typeof inputSchema>;

/**
 * Parse build output to extract error and warning counts
 * @param output Build stdout output
 * @returns Object with error and warning counts
 */
function parseBuildOutput(output: string): { 
  errors: number; 
  warnings: number; 
  outputPath?: string;
  succeeded: boolean;
} {
  const errorMatch = output.match(/(\d+)\s+Error\(s\)/i);
  const warningMatch = output.match(/(\d+)\s+Warning\(s\)/i);
  const succeededMatch = /Build succeeded/i.test(output);
  const failedMatch = /Build FAILED/i.test(output);
  
  // Extract output path (pattern: "ProjectName -> /path/to/output.dll")
  const outputPathMatch = output.match(/\s+->\s+(.+\.dll)/);
  
  return {
    errors: errorMatch ? parseInt(errorMatch[1], 10) : 0,
    warnings: warningMatch ? parseInt(warningMatch[1], 10) : 0,
    outputPath: outputPathMatch ? outputPathMatch[1] : undefined,
    succeeded: succeededMatch && !failedMatch
  };
}

/**
 * Format build result as markdown
 * @param input Tool input
 * @param exitCode Process exit code
 * @param stdout Standard output
 * @param stderr Standard error
 * @param timedOut Whether the process timed out
 * @returns Formatted markdown string
 */
function formatBuildResult(
  input: BuildRunInput,
  exitCode: number,
  stdout: string,
  stderr: string,
  timedOut: boolean
): string {
  if (timedOut) {
    return `# Build Timeout

The build operation exceeded the timeout limit of 120 seconds.

**Project**: ${input.projectPath}
**Configuration**: ${input.configuration}

## Output (Partial)

\`\`\`
${stdout.slice(0, 1000)}
\`\`\`

**Note**: Consider breaking the project into smaller components or increasing available resources.`;
  }

  const { errors, warnings, outputPath, succeeded } = parseBuildOutput(stdout);
  const status = exitCode === 0 ? 'Success' : 'Failed';

  let markdown = `# MonoGame Project Build

**Build Status**: ${status}
**Project**: ${input.projectPath}
**Configuration**: ${input.configuration}
**Warnings**: ${warnings}
**Errors**: ${errors}
`;

  if (outputPath) {
    markdown += `**Output**: ${outputPath}\n`;
  }

  markdown += '\n';

  // For failed builds, include error details and diagnostic suggestion
  if (exitCode !== 0) {
    markdown += '## Build Errors\n\n';
    
    if (stderr.trim()) {
      markdown += '```\n';
      markdown += stderr.trim();
      markdown += '\n```\n\n';
    }
    
    if (stdout.includes('error')) {
      // Extract error lines from stdout
      const errorLines = stdout.split('\n').filter(line => /error/i.test(line));
      if (errorLines.length > 0) {
        markdown += '**Error Messages**:\n\n```\n';
        markdown += errorLines.slice(0, 10).join('\n');
        markdown += '\n```\n\n';
      }
    }

    markdown += '## Suggested Action\n\n';
    markdown += 'Use the `monogame_diagnose_error` tool with the error message above for detailed troubleshooting and solutions.\n';
  } else if (warnings > 0) {
    markdown += '## Build Warnings\n\n';
    markdown += 'The build succeeded but generated warnings. Review the output below:\n\n';
    markdown += '```\n';
    markdown += stdout.slice(0, 2000);
    markdown += '\n```\n';
  } else {
    markdown += '## Build Output\n\n';
    markdown += 'Build completed successfully with no warnings or errors.\n';
  }

  return markdown;
}

/**
 * Format run result as markdown
 * @param input Tool input
 * @param exitCode Process exit code
 * @param stdout Standard output
 * @param stderr Standard error
 * @param timedOut Whether the process timed out
 * @returns Formatted markdown string
 */
function formatRunResult(
  input: BuildRunInput,
  exitCode: number,
  stdout: string,
  stderr: string,
  timedOut: boolean
): string {
  if (timedOut) {
    return `# Run Timeout

The run operation exceeded the timeout limit of 120 seconds.

**Project**: ${input.projectPath}
**Configuration**: ${input.configuration}

## Output (Partial)

\`\`\`
${stdout.slice(0, 1000)}
\`\`\`

**Note**: This is expected for long-running games. The timeout prevents indefinite execution.`;
  }

  const status = exitCode === 0 ? 'Success' : 'Failed';

  let markdown = `# MonoGame Project Run

**Run Status**: ${status}
**Project**: ${input.projectPath}
**Configuration**: ${input.configuration}

`;

  if (exitCode !== 0) {
    markdown += '## Run Errors\n\n';
    
    if (stderr.trim()) {
      markdown += '```\n';
      markdown += stderr.trim();
      markdown += '\n```\n\n';
    }
    
    markdown += '## Suggested Action\n\n';
    markdown += 'Check for runtime exceptions, missing content files, or initialization errors. ';
    markdown += 'Use the `monogame_diagnose_error` tool if you encounter specific error messages.\n';
  } else {
    markdown += '## Run Output\n\n';
    
    if (stdout.trim()) {
      markdown += '```\n';
      markdown += stdout.slice(0, 2000);
      markdown += '\n```\n';
    } else {
      markdown += 'Program completed successfully with no output.\n';
    }
  }

  return markdown;
}

/**
 * Handle monogame_build_run tool invocation
 * @param args Tool arguments (action, projectPath, configuration, restore)
 * @returns Tool result with build/run output
 */
export async function handleBuildRun(args: unknown): Promise<CallToolResult> {
  try {
    // Parse and validate input
    const input = inputSchema.parse(args) as BuildRunInput;
    
    // Check dotnet prerequisite
    const prereqCheck = await checkPrerequisite('dotnet');
    if (!prereqCheck.available) {
      return {
        content: [{
          type: 'text',
          text: `# Prerequisite Not Met

${prereqCheck.message}

**Required**: .NET SDK must be installed to build or run MonoGame projects.

**Installation**: Download from https://dotnet.microsoft.com/download`
        }]
      };
    }

    // Build command arguments based on action
    let commandArgs: string[];
    
    if (input.action === 'build') {
      commandArgs = ['build', input.projectPath, '-c', input.configuration];
      if (!input.restore) {
        commandArgs.push('--no-restore');
      }
    } else { // run
      commandArgs = ['run', '--project', input.projectPath, '-c', input.configuration];
      if (!input.restore) {
        commandArgs.push('--no-restore');
      }
    }

    // Execute command with 120 second timeout
    const result = await executeCommand('dotnet', commandArgs, {
      timeout: 120000
    });

    // Format output based on action
    const markdown = input.action === 'build'
      ? formatBuildResult(input, result.exitCode, result.stdout, result.stderr, result.timedOut)
      : formatRunResult(input, result.exitCode, result.stdout, result.stderr, result.timedOut);

    return {
      content: [{
        type: 'text',
        text: markdown
      }]
    };

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `- ${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      
      return {
        content: [{
          type: 'text',
          text: `# Input Validation Error

${issues}

## Required Parameters
- **action**: Either "build" or "run"
- **projectPath**: Path to .csproj file

## Optional Parameters
- **configuration**: "Debug" (default) or "Release"
- **restore**: true (default) or false`
        }]
      };
    }

    // Handle unexpected errors
    return {
      content: [{
        type: 'text',
        text: `# Unexpected Error

${error instanceof Error ? error.message : String(error)}

Please ensure the project path is valid and the dotnet CLI is properly installed.`
      }]
    };
  }
}
