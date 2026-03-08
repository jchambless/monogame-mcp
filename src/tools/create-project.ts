import path from 'node:path';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ZodError, z } from 'zod';
import { MonoGameTemplate } from '../types.js';
import { checkPrerequisite, executeCommand } from '../utils/subprocess.js';

const inputSchema = z.object({
  projectName: z
    .string()
    .regex(/^[a-zA-Z0-9_]{1,100}$/, 'projectName must be alphanumeric/underscore only (1-100 chars)'),
  template: z.enum(['desktopgl', 'windowsdx', 'android', 'ios', 'shared']),
  outputDirectory: z.string().trim().min(1, 'outputDirectory cannot be empty').optional(),
});

const TEMPLATE_MAP = {
  desktopgl: MonoGameTemplate.DesktopGL,
  windowsdx: MonoGameTemplate.WindowsDX,
  android: MonoGameTemplate.Android,
  ios: MonoGameTemplate.iOS,
  shared: MonoGameTemplate.Shared,
} as const;

type CreateProjectInput = z.infer<typeof inputSchema>;

export const createProjectTool = {
  name: 'monogame_create_project',
  description: 'Create a new MonoGame project using dotnet templates',
  inputSchema,
};

export async function handleCreateProject(args: unknown): Promise<CallToolResult> {
  let input: CreateProjectInput;

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

  const dotnetStatus = await checkPrerequisite('dotnet');
  if (!dotnetStatus.available) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: [
            '# dotnet SDK is required',
            '',
            dotnetStatus.message,
            '',
            'Install .NET SDK:',
            '- https://dotnet.microsoft.com/download',
          ].join('\n'),
        },
      ],
    };
  }

  const templateListResult = await executeCommand('dotnet', ['new', 'list', '--tag', 'MonoGame']);
  if (templateListResult.exitCode !== 0 || templateListResult.timedOut) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: [
            '# Unable to verify MonoGame templates',
            '',
            templateListResult.stderr.trim() || 'Failed to query templates with dotnet new list --tag MonoGame.',
            '',
            'Install MonoGame templates:',
            '- `dotnet new install MonoGame.Templates.CSharp`',
          ].join('\n'),
        },
      ],
    };
  }

  const mappedTemplate = TEMPLATE_MAP[input.template];
  const templateListStdout = templateListResult.stdout.toLowerCase();
  if (!templateListStdout.includes(mappedTemplate)) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: [
            '# MonoGame templates are not installed',
            '',
            `Template '${mappedTemplate}' was not found in \'dotnet new list --tag MonoGame\'.`,
            '',
            'Install MonoGame templates:',
            '- `dotnet new install MonoGame.Templates.CSharp`',
          ].join('\n'),
        },
      ],
    };
  }

  const workingDirectory = input.outputDirectory ?? process.cwd();
  const createResult = await executeCommand(
    'dotnet',
    ['new', mappedTemplate, '-n', input.projectName],
    { cwd: workingDirectory },
  );

  if (createResult.exitCode !== 0 || createResult.timedOut) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: [
            '# Failed to create project',
            '',
            createResult.stderr.trim() || createResult.stdout.trim() || 'dotnet new command failed.',
          ].join('\n'),
        },
      ],
    };
  }

  const projectPath = path.join(workingDirectory, input.projectName);
  return {
    content: [
      {
        type: 'text',
        text: [
          '# Project created successfully',
          '',
          `Project path: \`${projectPath}\``,
          '',
          'Next steps:',
          `1. \`cd ${projectPath}\``,
          '2. `dotnet restore`',
          '3. `dotnet run`',
        ].join('\n'),
      },
    ],
  };
}
