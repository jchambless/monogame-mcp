import { describe, expect, it, beforeEach, vi } from 'vitest';
import { createProjectTool, handleCreateProject } from '../../src/tools/create-project.js';
import { checkPrerequisite, executeCommand } from '../../src/utils/subprocess.js';

vi.mock('../../src/utils/subprocess.js', () => ({
  checkPrerequisite: vi.fn(),
  executeCommand: vi.fn(),
}));

const mockedCheckPrerequisite = vi.mocked(checkPrerequisite);
const mockedExecuteCommand = vi.mocked(executeCommand);

function getText(result: { content: Array<{ type: string; text?: string }> }): string {
  const textBlock = result.content.find((item) => item.type === 'text');
  return textBlock?.text ?? '';
}

describe('Create Project Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports tool metadata for monogame_create_project', () => {
    expect(createProjectTool.name).toBe('monogame_create_project');
    expect(createProjectTool.description).toContain('Create a new MonoGame project');
  });

  it('returns validation error for invalid projectName characters', async () => {
    const result = await handleCreateProject({
      projectName: 'Bad-Name!',
      template: 'desktopgl',
    });

    expect(result.isError).toBe(true);
    expect(getText(result)).toContain('Validation error');
    expect(getText(result)).toContain('projectName');
    expect(mockedCheckPrerequisite).not.toHaveBeenCalled();
  });

  it('returns validation error when projectName exceeds 100 chars', async () => {
    const result = await handleCreateProject({
      projectName: 'a'.repeat(101),
      template: 'desktopgl',
    });

    expect(result.isError).toBe(true);
    expect(getText(result)).toContain('Validation error');
    expect(getText(result)).toContain('100');
  });

  it('returns install instructions when dotnet prerequisite is missing', async () => {
    mockedCheckPrerequisite.mockResolvedValue({
      available: false,
      message: 'dotnet is not available',
    });

    const result = await handleCreateProject({
      projectName: 'MyGame',
      template: 'desktopgl',
    });

    expect(result.isError).toBe(true);
    const text = getText(result);
    expect(text).toContain('dotnet SDK is required');
    expect(text).toContain('dotnet is not available');
    expect(text).toContain('https://dotnet.microsoft.com/download');
    expect(mockedExecuteCommand).not.toHaveBeenCalled();
  });

  it('returns install instructions when MonoGame templates are missing', async () => {
    mockedCheckPrerequisite.mockResolvedValue({
      available: true,
      version: '8.0.100',
      message: 'dotnet is available (8.0.100)',
    });

    mockedExecuteCommand.mockResolvedValue({
      exitCode: 0,
      stdout: 'No templates found matching: MonoGame',
      stderr: '',
      timedOut: false,
    });

    const result = await handleCreateProject({
      projectName: 'MyGame',
      template: 'desktopgl',
    });

    expect(result.isError).toBe(true);
    const text = getText(result);
    expect(text).toContain('MonoGame templates are not installed');
    expect(text).toContain('dotnet new install MonoGame.Templates.CSharp');
    expect(mockedExecuteCommand).toHaveBeenCalledWith('dotnet', ['new', 'list', '--tag', 'MonoGame']);
  });

  it('creates project successfully with mapped template and default cwd', async () => {
    mockedCheckPrerequisite.mockResolvedValue({
      available: true,
      version: '8.0.100',
      message: 'dotnet is available (8.0.100)',
    });

    mockedExecuteCommand
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: 'mgdesktopgl  MonoGame DesktopGL App',
        stderr: '',
        timedOut: false,
      })
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: 'The template "MonoGame DesktopGL Application" was created successfully.',
        stderr: '',
        timedOut: false,
      });

    const result = await handleCreateProject({
      projectName: 'MyGame',
      template: 'desktopgl',
    });

    expect(result.isError).not.toBe(true);
    const text = getText(result);
    expect(text).toContain('Project created successfully');
    expect(text).toContain('MyGame');
    expect(mockedExecuteCommand).toHaveBeenNthCalledWith(
      2,
      'dotnet',
      ['new', 'mgdesktopgl', '-n', 'MyGame'],
      { cwd: process.cwd() },
    );
  });

  it('creates project in provided outputDirectory', async () => {
    mockedCheckPrerequisite.mockResolvedValue({
      available: true,
      version: '8.0.100',
      message: 'dotnet is available (8.0.100)',
    });

    mockedExecuteCommand
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: 'mgwindowsdx  MonoGame WindowsDX App',
        stderr: '',
        timedOut: false,
      })
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: 'success',
        stderr: '',
        timedOut: false,
      });

    const result = await handleCreateProject({
      projectName: 'WinGame',
      template: 'windowsdx',
      outputDirectory: '/tmp/projects',
    });

    expect(result.isError).not.toBe(true);
    expect(mockedExecuteCommand).toHaveBeenNthCalledWith(
      2,
      'dotnet',
      ['new', 'mgwindowsdx', '-n', 'WinGame'],
      { cwd: '/tmp/projects' },
    );
  });

  it('returns error message when project creation command fails', async () => {
    mockedCheckPrerequisite.mockResolvedValue({
      available: true,
      version: '8.0.100',
      message: 'dotnet is available (8.0.100)',
    });

    mockedExecuteCommand
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: 'mgandroid  MonoGame Android App',
        stderr: '',
        timedOut: false,
      })
      .mockResolvedValueOnce({
        exitCode: 1,
        stdout: '',
        stderr: 'Invalid project name',
        timedOut: false,
      });

    const result = await handleCreateProject({
      projectName: 'AndroidGame',
      template: 'android',
    });

    expect(result.isError).toBe(true);
    const text = getText(result);
    expect(text).toContain('Failed to create project');
    expect(text).toContain('Invalid project name');
  });
});
