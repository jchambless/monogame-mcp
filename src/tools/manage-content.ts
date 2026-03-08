import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ZodError, z } from 'zod';
import {
  addContentEntry,
  getImporterForExtension,
  getProcessorForImporter,
  parseMgcb,
  removeContentEntry,
  serializeMgcb,
} from '../utils/mgcb-parser.js';

const inputSchema = z.object({
  action: z.enum(['add', 'remove', 'list', 'info']),
  mgcbPath: z.string().trim().min(1, 'mgcbPath is required'),
  assetPath: z.string().trim().min(1).optional(),
  importer: z.string().trim().min(1).optional(),
  processor: z.string().trim().min(1).optional(),
  processorParams: z.record(z.string(), z.string()).optional(),
});

type ManageContentInput = z.infer<typeof inputSchema>;

export const manageContentTool = {
  name: 'monogame_manage_content',
  description: 'Add, remove, or configure assets in a MonoGame .mgcb content project file',
  inputSchema,
};

export async function handleManageContent(args: unknown): Promise<CallToolResult> {
  let input: ManageContentInput;

  try {
    input = inputSchema.parse(args);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResult(`Validation error: ${error.issues.map((issue) => issue.message).join('; ')}`);
    }

    throw error;
  }

  try {
    await access(input.mgcbPath);
  } catch {
    return errorResult(`MGCB file not found: ${input.mgcbPath}`);
  }

  const mgcbContent = await readFile(input.mgcbPath, 'utf-8');
  const project = parseMgcb(mgcbContent);

  if (input.action === 'add') {
    return handleAddAction(input, project);
  }

  if (input.action === 'remove') {
    return handleRemoveAction(input, project);
  }

  if (input.action === 'list') {
    return textResult(formatList(project.entries));
  }

  return textResult(formatInfo(project));
}

async function handleAddAction(input: ManageContentInput, project: ReturnType<typeof parseMgcb>): Promise<CallToolResult> {
  if (!input.assetPath) {
    return errorResult('assetPath is required for add action');
  }

  const extension = path.extname(input.assetPath);
  const importer = input.importer ?? getImporterForExtension(extension);

  if (!importer) {
    return errorResult(`Could not detect importer for '${input.assetPath}'. Provide importer explicitly.`);
  }

  const processor = input.processor ?? getProcessorForImporter(importer);

  const updatedProject = addContentEntry(project, {
    path: input.assetPath,
    importer,
    processor,
    processorParams: input.processorParams ?? {},
    buildAction: input.assetPath,
  });

  await writeFile(input.mgcbPath, serializeMgcb(updatedProject), 'utf-8');

  return textResult([
    '# MGCB Content Update',
    '',
    `Added asset: ${input.assetPath}`,
    `Importer: ${importer}`,
    `Processor: ${processor}`,
    `Project file: ${input.mgcbPath}`,
  ].join('\n'));
}

async function handleRemoveAction(input: ManageContentInput, project: ReturnType<typeof parseMgcb>): Promise<CallToolResult> {
  if (!input.assetPath) {
    return errorResult('assetPath is required for remove action');
  }

  const updatedProject = removeContentEntry(project, input.assetPath);
  if (updatedProject.entries.length === project.entries.length) {
    return errorResult(`Asset not found: '${input.assetPath}'`);
  }

  await writeFile(input.mgcbPath, serializeMgcb(updatedProject), 'utf-8');

  return textResult([
    '# MGCB Content Update',
    '',
    `Removed asset: ${input.assetPath}`,
    `Project file: ${input.mgcbPath}`,
  ].join('\n'));
}

function formatList(entries: ReturnType<typeof parseMgcb>['entries']): string {
  const lines = ['# MGCB Content Entries', ''];

  if (entries.length === 0) {
    lines.push('No content entries found.');
    return lines.join('\n');
  }

  lines.push(`Total entries: ${entries.length}`, '');

  entries.forEach((entry, index) => {
    lines.push(`${index + 1}. Path: ${entry.path}`);
    lines.push(`   Importer: ${entry.importer || '(not set)'}`);
    lines.push(`   Processor: ${entry.processor || '(not set)'}`);
    if (Object.keys(entry.processorParams).length > 0) {
      lines.push(`   Processor Params: ${JSON.stringify(entry.processorParams)}`);
    }
    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

function formatInfo(project: ReturnType<typeof parseMgcb>): string {
  return [
    '# MGCB Project Info',
    '',
    `Platform: ${project.platform || '(not set)'}`,
    `Output Directory: ${project.outputDir || '(not set)'}`,
    `Intermediate Directory: ${project.intermediateDir || '(not set)'}`,
    `References: ${project.references.length}`,
    `Content Entries: ${project.entries.length}`,
  ].join('\n');
}

function textResult(text: string): CallToolResult {
  return {
    content: [{ type: 'text', text }],
  };
}

function errorResult(message: string): CallToolResult {
  return {
    isError: true,
    content: [{ type: 'text', text: message }],
  };
}
