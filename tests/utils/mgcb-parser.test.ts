import { describe, expect, it } from 'vitest';
import type { MgcbEntry, MgcbProject } from '../../src/types.js';
import {
  addContentEntry,
  getImporterForExtension,
  getProcessorForImporter,
  parseMgcb,
  removeContentEntry,
  serializeMgcb,
} from '../../src/utils/mgcb-parser.js';

const sampleMgcb = `#----------------------------- Global Properties ----------------------------#

/outputDir:bin/$(Platform)
/intermediateDir:obj/$(Platform)
/platform:DesktopGL
/config:
/profile:Reach
/compress:False

#-------------------------------- References --------------------------------#

/reference:MyGame.Content.Pipeline.dll

#---------------------------------- Content ---------------------------------#

#begin Sprites/player.png
/importer:TextureImporter
/processor:TextureProcessor
/processorParam:ColorKeyEnabled=True
/build:Sprites/player.png
`;

describe('mgcb parser', () => {
  it('parses valid .mgcb file into MgcbProject structure', () => {
    const project = parseMgcb(sampleMgcb);

    expect(project.outputDir).toBe('bin/$(Platform)');
    expect(project.intermediateDir).toBe('obj/$(Platform)');
    expect(project.platform).toBe('DesktopGL');
    expect(project.references).toEqual(['MyGame.Content.Pipeline.dll']);
    expect(project.entries).toHaveLength(1);
    expect(project.entries[0]).toEqual({
      path: 'Sprites/player.png',
      importer: 'TextureImporter',
      processor: 'TextureProcessor',
      processorParams: { ColorKeyEnabled: 'True' },
      buildAction: 'Sprites/player.png',
    });
  });

  it('parses empty .mgcb content into empty project defaults', () => {
    const project = parseMgcb('');

    expect(project).toEqual({
      outputDir: '',
      intermediateDir: '',
      platform: '',
      references: [],
      entries: [],
    });
  });

  it('parses multiple content entries', () => {
    const content = `${sampleMgcb}\n#begin Audio/theme.wav\n/importer:WavImporter\n/processor:SoundEffectProcessor\n/build:Audio/theme.wav\n`;
    const project = parseMgcb(content);

    expect(project.entries).toHaveLength(2);
    expect(project.entries[1]).toEqual({
      path: 'Audio/theme.wav',
      importer: 'WavImporter',
      processor: 'SoundEffectProcessor',
      processorParams: {},
      buildAction: 'Audio/theme.wav',
    });
  });

  it('ignores comments while parsing content', () => {
    const content = `# comment\n/outputDir:bin\n# another\n#begin Textures/tile.png\n# nested comment\n/importer:TextureImporter\n/processor:TextureProcessor\n/build:Textures/tile.png`;
    const project = parseMgcb(content);

    expect(project.outputDir).toBe('bin');
    expect(project.entries).toHaveLength(1);
    expect(project.entries[0].path).toBe('Textures/tile.png');
  });

  it('serializes MgcbProject into valid mgcb text', () => {
    const project: MgcbProject = {
      outputDir: 'bin/Windows',
      intermediateDir: 'obj/Windows',
      platform: 'WindowsDX',
      references: ['MyRef.dll'],
      entries: [
        {
          path: 'Textures/bg.png',
          importer: 'TextureImporter',
          processor: 'TextureProcessor',
          processorParams: { GenerateMipmaps: 'False' },
          buildAction: 'Textures/bg.png',
        },
      ],
    };

    const text = serializeMgcb(project);

    expect(text).toContain('/outputDir:bin/Windows');
    expect(text).toContain('/intermediateDir:obj/Windows');
    expect(text).toContain('/platform:WindowsDX');
    expect(text).toContain('/reference:MyRef.dll');
    expect(text).toContain('#begin Textures/bg.png');
    expect(text).toContain('/processorParam:GenerateMipmaps=False');
  });

  it('supports parse-serialize-parse round trip', () => {
    const once = parseMgcb(sampleMgcb);
    const serialized = serializeMgcb(once);
    const twice = parseMgcb(serialized);

    expect(twice).toEqual(once);
  });

  it('adds a content entry immutably', () => {
    const project = parseMgcb(sampleMgcb);
    const entry: MgcbEntry = {
      path: 'Fonts/ui.spritefont',
      importer: 'FontDescriptionImporter',
      processor: 'FontDescriptionProcessor',
      processorParams: {},
      buildAction: 'Fonts/ui.spritefont',
    };

    const updated = addContentEntry(project, entry);

    expect(updated.entries).toHaveLength(2);
    expect(updated.entries[1]).toEqual(entry);
    expect(project.entries).toHaveLength(1);
  });

  it('removes a content entry by asset path', () => {
    const project = parseMgcb(sampleMgcb);
    const withExtra = addContentEntry(project, {
      path: 'Audio/theme.wav',
      importer: 'WavImporter',
      processor: 'SoundEffectProcessor',
      processorParams: {},
      buildAction: 'Audio/theme.wav',
    });

    const updated = removeContentEntry(withExtra, 'Audio/theme.wav');

    expect(updated.entries).toHaveLength(1);
    expect(updated.entries[0].path).toBe('Sprites/player.png');
  });

  it('maps .png extension to TextureImporter', () => {
    expect(getImporterForExtension('.png')).toBe('TextureImporter');
  });

  it('maps .wav extension to WavImporter', () => {
    expect(getImporterForExtension('.wav')).toBe('WavImporter');
  });

  it('returns undefined for unknown extension', () => {
    expect(getImporterForExtension('.xyz')).toBeUndefined();
  });

  it('maps importer to processor defaults', () => {
    expect(getProcessorForImporter('TextureImporter')).toBe('TextureProcessor');
    expect(getProcessorForImporter('WavImporter')).toBe('SoundEffectProcessor');
    expect(getProcessorForImporter('UnknownImporter')).toBe('PassThroughProcessor');
  });
});
