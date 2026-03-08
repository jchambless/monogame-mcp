import type { MgcbEntry, MgcbProject } from '../types.js';

const IMPORTER_BY_EXTENSION: Record<string, string> = {
  '.png': 'TextureImporter',
  '.jpg': 'TextureImporter',
  '.jpeg': 'TextureImporter',
  '.bmp': 'TextureImporter',
  '.gif': 'TextureImporter',
  '.wav': 'WavImporter',
  '.mp3': 'Mp3Importer',
  '.ogg': 'OggImporter',
  '.wma': 'Mp3Importer',
  '.spritefont': 'FontDescriptionImporter',
  '.fx': 'EffectImporter',
  '.fbx': 'FbxImporter',
  '.x': 'FbxImporter',
  '.dae': 'FbxImporter',
};

const PROCESSOR_BY_IMPORTER: Record<string, string> = {
  TextureImporter: 'TextureProcessor',
  WavImporter: 'SoundEffectProcessor',
  Mp3Importer: 'SoundEffectProcessor',
  OggImporter: 'SoundEffectProcessor',
  FontDescriptionImporter: 'FontDescriptionProcessor',
  EffectImporter: 'EffectProcessor',
  FbxImporter: 'ModelProcessor',
};

export function parseMgcb(content: string): MgcbProject {
  const project: MgcbProject = {
    outputDir: '',
    intermediateDir: '',
    platform: '',
    references: [],
    entries: [],
  };
  let currentEntry: MgcbEntry | undefined;

  const flushEntry = (): void => {
    if (currentEntry) {
      project.entries.push(currentEntry);
      currentEntry = undefined;
    }
  };

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') && !line.startsWith('#begin ')) continue;

    if (line.startsWith('#begin ')) {
      flushEntry();
      const path = line.slice('#begin '.length).trim();
      currentEntry = { path, importer: '', processor: '', processorParams: {}, buildAction: path };
      continue;
    }

    if (line.startsWith('/outputDir:')) project.outputDir = line.slice('/outputDir:'.length);
    else if (line.startsWith('/intermediateDir:')) project.intermediateDir = line.slice('/intermediateDir:'.length);
    else if (line.startsWith('/platform:')) project.platform = line.slice('/platform:'.length);
    else if (line.startsWith('/reference:')) project.references.push(line.slice('/reference:'.length));
    else if (currentEntry && line.startsWith('/importer:')) currentEntry.importer = line.slice('/importer:'.length);
    else if (currentEntry && line.startsWith('/processor:')) currentEntry.processor = line.slice('/processor:'.length);
    else if (currentEntry && line.startsWith('/build:')) currentEntry.buildAction = line.slice('/build:'.length);
    else if (currentEntry && line.startsWith('/processorParam:')) {
      const payload = line.slice('/processorParam:'.length);
      const [key, ...rest] = payload.split('=');
      currentEntry.processorParams[key] = rest.join('=');
    }
  }

  flushEntry();
  return project;
}

export function serializeMgcb(project: MgcbProject): string {
  const lines = [
    '#----------------------------- Global Properties ----------------------------#',
    '',
    `/outputDir:${project.outputDir}`,
    `/intermediateDir:${project.intermediateDir}`,
    `/platform:${project.platform}`,
    '/config:',
    '/profile:Reach',
    '/compress:False',
    '',
    '#-------------------------------- References --------------------------------#',
    '',
    ...project.references.map((reference) => `/reference:${reference}`),
    '',
    '#---------------------------------- Content ---------------------------------#',
    '',
  ];

  for (const entry of project.entries) {
    lines.push(`#begin ${entry.path}`);
    lines.push(`/importer:${entry.importer}`);
    lines.push(`/processor:${entry.processor}`);
    for (const [key, value] of Object.entries(entry.processorParams)) {
      lines.push(`/processorParam:${key}=${value}`);
    }
    lines.push(`/build:${entry.buildAction || entry.path}`);
  }

  return `${lines.join('\n')}\n`;
}

export function addContentEntry(project: MgcbProject, entry: MgcbEntry): MgcbProject {
  return { ...project, entries: [...project.entries, entry] };
}

export function removeContentEntry(project: MgcbProject, assetPath: string): MgcbProject {
  return { ...project, entries: project.entries.filter((entry) => entry.path !== assetPath) };
}

export function getImporterForExtension(ext: string): string | undefined {
  const normalizedExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  return IMPORTER_BY_EXTENSION[normalizedExt];
}

export function getProcessorForImporter(importer: string): string {
  return PROCESSOR_BY_IMPORTER[importer] ?? 'PassThroughProcessor';
}
