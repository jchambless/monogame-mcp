/**
 * Tests for Build and Run Project Tool (Task 16)
 * 
 * TDD Approach: Tests written first, then implementation to make them pass.
 * Tests verify build/run actions, prerequisite checks, output parsing,
 * error handling, and timeout scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleBuildRun } from '../../src/tools/build-run.js';
import * as subprocess from '../../src/utils/subprocess.js';

// Mock subprocess module
vi.mock('../../src/utils/subprocess.js', () => ({
  executeCommand: vi.fn(),
  checkPrerequisite: vi.fn(),
}));

describe('Build and Run Project Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Prerequisite Checks', () => {
    it('should check dotnet prerequisite before build action', async () => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);

      mockCheckPrerequisite.mockResolvedValue({
        available: false,
        message: 'dotnet is not available'
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj'
      });

      expect(mockCheckPrerequisite).toHaveBeenCalledWith('dotnet');
      expect(mockExecuteCommand).not.toHaveBeenCalled();
      expect(result.content).toHaveLength(1);
      
      const text = result.content[0].text;
      expect(text).toContain('dotnet is not available');
      expect(text).toContain('Prerequisite');
    });

    it('should check dotnet prerequisite before run action', async () => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);

      mockCheckPrerequisite.mockResolvedValue({
        available: false,
        message: 'dotnet is not available'
      });

      const result = await handleBuildRun({
        action: 'run',
        projectPath: './MyGame.csproj'
      });

      expect(mockCheckPrerequisite).toHaveBeenCalledWith('dotnet');
      expect(mockExecuteCommand).not.toHaveBeenCalled();
      expect(result.content[0].text).toContain('dotnet is not available');
    });

    it('should proceed with build when dotnet is available', async () => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);

      mockCheckPrerequisite.mockResolvedValue({
        available: true,
        version: '8.0.100',
        message: 'dotnet is available (8.0.100)'
      });

      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Build succeeded.',
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj'
      });

      expect(mockCheckPrerequisite).toHaveBeenCalledWith('dotnet');
      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(result.content[0].text).toContain('**Build Status**: Success');
    });
  });

  describe('Build Action', () => {
    beforeEach(() => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      mockCheckPrerequisite.mockResolvedValue({
        available: true,
        version: '8.0.100',
        message: 'dotnet is available (8.0.100)'
      });
    });

    it('should build with Debug configuration by default', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Build succeeded. 0 Warning(s). 0 Error(s).',
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj'
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'dotnet',
        ['build', './MyGame.csproj', '-c', 'Debug'],
        { timeout: 120000 }
      );
      
      const text = result.content[0].text;
      expect(text).toContain('**Build Status**: Success');
      expect(text).toContain('**Configuration**: Debug');
    });

    it('should build with Release configuration when specified', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Build succeeded. 0 Warning(s). 0 Error(s).',
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj',
        configuration: 'Release'
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'dotnet',
        ['build', './MyGame.csproj', '-c', 'Release'],
        { timeout: 120000 }
      );
      
      const text = result.content[0].text;
      expect(text).toContain('**Configuration**: Release');
    });

    it('should add --no-restore flag when restore is false', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Build succeeded.',
        stderr: '',
        timedOut: false
      });

      await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj',
        restore: false
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'dotnet',
        ['build', './MyGame.csproj', '-c', 'Debug', '--no-restore'],
        { timeout: 120000 }
      );
    });

    it('should parse successful build output with warnings and errors', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: `Microsoft (R) Build Engine version 17.0.0
Build succeeded.
    3 Warning(s)
    0 Error(s)
Time Elapsed 00:00:05.23`,
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('**Build Status**: Success');
      expect(text).toContain('**Warnings**: 3');
      expect(text).toContain('**Errors**: 0');
    });

    it('should handle build failure and suggest error diagnosis', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 1,
        stdout: `Build FAILED.
    0 Warning(s)
    5 Error(s)
Time Elapsed 00:00:02.45`,
        stderr: 'Error CS0246: The type or namespace name could not be found',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('**Build Status**: Failed');
      expect(text).toContain('**Errors**: 5');
      expect(text).toContain('monogame_diagnose_error');
      expect(text).toContain('CS0246');
    });

    it('should handle build timeout', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: -1,
        stdout: 'Partial build output...',
        stderr: '',
        timedOut: true
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('timeout');
      expect(text).toContain('120 seconds');
    });
  });

  describe('Run Action', () => {
    beforeEach(() => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      mockCheckPrerequisite.mockResolvedValue({
        available: true,
        version: '8.0.100',
        message: 'dotnet is available (8.0.100)'
      });
    });

    it('should run with Debug configuration by default', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Game started successfully',
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'run',
        projectPath: './MyGame.csproj'
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'dotnet',
        ['run', '--project', './MyGame.csproj', '-c', 'Debug'],
        { timeout: 120000 }
      );
      
      const text = result.content[0].text;
      expect(text).toContain('**Run Status**: Success');
      expect(text).toContain('**Configuration**: Debug');
    });

    it('should run with Release configuration when specified', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Game started',
        stderr: '',
        timedOut: false
      });

      await handleBuildRun({
        action: 'run',
        projectPath: './MyGame.csproj',
        configuration: 'Release'
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'dotnet',
        ['run', '--project', './MyGame.csproj', '-c', 'Release'],
        { timeout: 120000 }
      );
    });

    it('should add --no-restore flag when restore is false', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Game started',
        stderr: '',
        timedOut: false
      });

      await handleBuildRun({
        action: 'run',
        projectPath: './MyGame.csproj',
        restore: false
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'dotnet',
        ['run', '--project', './MyGame.csproj', '-c', 'Debug', '--no-restore'],
        { timeout: 120000 }
      );
    });

    it('should handle run failure with error output', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'Unhandled exception. System.NullReferenceException',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'run',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('**Run Status**: Failed');
      expect(text).toContain('NullReferenceException');
    });

    it('should handle run timeout', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: -1,
        stdout: 'Game running...',
        stderr: '',
        timedOut: true
      });

      const result = await handleBuildRun({
        action: 'run',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('timeout');
      expect(text).toContain('120 seconds');
    });
  });

  describe('Input Validation', () => {
    it('should require action parameter', async () => {
      const result = await handleBuildRun({
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('action');
      expect(text).toMatch(/required|invalid/i);
    });

    it('should require projectPath parameter', async () => {
      const result = await handleBuildRun({
        action: 'build'
      });

      const text = result.content[0].text;
      expect(text).toContain('projectPath');
      expect(text).toMatch(/required|invalid/i);
    });

    it('should validate action enum values', async () => {
      const result = await handleBuildRun({
        action: 'invalid-action',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toMatch(/invalid|build|run/i);
    });

    it('should validate configuration enum values', async () => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      mockCheckPrerequisite.mockResolvedValue({
        available: true,
        version: '8.0.100',
        message: 'dotnet is available'
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj',
        configuration: 'InvalidConfig'
      });

      const text = result.content[0].text;
      expect(text).toMatch(/invalid|debug|release/i);
    });

    it('should accept restore parameter as boolean', async () => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);

      mockCheckPrerequisite.mockResolvedValue({
        available: true,
        version: '8.0.100',
        message: 'dotnet is available'
      });

      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Build succeeded.',
        stderr: '',
        timedOut: false
      });

      // Test restore: true
      await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj',
        restore: true
      });

      let calls = mockExecuteCommand.mock.calls;
      expect(calls[calls.length - 1][1]).not.toContain('--no-restore');

      // Test restore: false
      await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj',
        restore: false
      });

      calls = mockExecuteCommand.mock.calls;
      expect(calls[calls.length - 1][1]).toContain('--no-restore');
    });
  });

  describe('Output Formatting', () => {
    beforeEach(() => {
      const mockCheckPrerequisite = vi.mocked(subprocess.checkPrerequisite);
      mockCheckPrerequisite.mockResolvedValue({
        available: true,
        version: '8.0.100',
        message: 'dotnet is available'
      });
    });

    it('should format build success as markdown', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Build succeeded. 2 Warning(s). 0 Error(s).',
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj',
        configuration: 'Release'
      });

      const text = result.content[0].text;
      
      // Verify markdown structure
      expect(text).toContain('#');
      expect(text).toContain('**Build Status**:');
      expect(text).toContain('**Project**:');
      expect(text).toContain('**Configuration**:');
      expect(text).toContain('**Warnings**:');
      expect(text).toContain('**Errors**:');
    });

    it('should include output path for successful builds', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: `Build succeeded.
    0 Warning(s)
    0 Error(s)
    MyGame -> /path/to/bin/Debug/net8.0/MyGame.dll`,
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'build',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('**Output**:');
      expect(text).toContain('MyGame.dll');
    });

    it('should format run output clearly', async () => {
      const mockExecuteCommand = vi.mocked(subprocess.executeCommand);
      mockExecuteCommand.mockResolvedValue({
        exitCode: 0,
        stdout: 'Game started\nFrame 1\nFrame 2\nGame exited',
        stderr: '',
        timedOut: false
      });

      const result = await handleBuildRun({
        action: 'run',
        projectPath: './MyGame.csproj'
      });

      const text = result.content[0].text;
      expect(text).toContain('**Run Status**: Success');
      expect(text).toContain('**Project**:');
      expect(text).toContain('**Configuration**:');
      expect(text).toContain('## Run Output');
    });
  });
});
