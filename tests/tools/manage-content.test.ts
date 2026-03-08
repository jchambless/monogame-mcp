import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { handleManageContent, manageContentTool } from '../../src/tools/manage-content.js';

const BASE_MGCB = `#----------------------------- Global Properties ----------------------------#

/outputDir:bin/$(Platform)
/intermediateDir:obj/$(Platform)
/platform:DesktopGL
/config:
/profile:Reach
/compress:False

#-------------------------------- References --------------------------------#


#---------------------------------- Content ---------------------------------#

#begin Sprites/player.png
/importer:TextureImporter
/processor:TextureProcessor
/build:Sprites/player.png
`;

describe('Manage Content Tool', () => {
  let tempDir = '';
  let mgcbPath = '';

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'mgcb-manage-content-'));
    mgcbPath = path.join(tempDir, 'Content.mgcb');
    await writeFile(mgcbPath, BASE_MGCB, 'utf-8');
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('exports monogame_manage_content tool metadata', () => {
    expect(manageContentTool.name).toBe('monogame_manage_content');
    expect(manageContentTool.description).toContain('.mgcb');
    expect(manageContentTool.inputSchema).toBeDefined();
  });

  it('adds png asset with auto-detected importer and processor', async () => {
    const result = await handleManageContent({
      action: 'add',
      mgcbPath,
      assetPath: 'Sprites/enemy.png',
    });

    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('Added asset: Sprites/enemy.png');
    expect(text).toContain('Importer: TextureImporter');
    expect(text).toContain('Processor: TextureProcessor');

    const updated = await readFile(mgcbPath, 'utf-8');
    expect(updated).toContain('#begin Sprites/enemy.png');
    expect(updated).toContain('/importer:TextureImporter');
    expect(updated).toContain('/processor:TextureProcessor');
  });

  it('adds wav asset with WavImporter and SoundEffectProcessor', async () => {
    const result = await handleManageContent({
      action: 'add',
      mgcbPath,
      assetPath: 'Audio/jump.wav',
    });

    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('Added asset: Audio/jump.wav');
    expect(text).toContain('Importer: WavImporter');
    expect(text).toContain('Processor: SoundEffectProcessor');
  });

  it('uses custom importer and processor overrides on add', async () => {
    const result = await handleManageContent({
      action: 'add',
      mgcbPath,
      assetPath: 'Data/config.json',
      importer: 'JsonImporter',
      processor: 'PassThroughProcessor',
      processorParams: {
        Compress: 'False',
      },
    });

    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('Added asset: Data/config.json');
    expect(text).toContain('Importer: JsonImporter');
    expect(text).toContain('Processor: PassThroughProcessor');

    const updated = await readFile(mgcbPath, 'utf-8');
    expect(updated).toContain('/processorParam:Compress=False');
  });

  it('removes an existing asset and writes file', async () => {
    const result = await handleManageContent({
      action: 'remove',
      mgcbPath,
      assetPath: 'Sprites/player.png',
    });

    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('Removed asset: Sprites/player.png');

    const updated = await readFile(mgcbPath, 'utf-8');
    expect(updated).not.toContain('#begin Sprites/player.png');
  });

  it('returns helpful error when removing non-existent asset', async () => {
    const result = await handleManageContent({
      action: 'remove',
      mgcbPath,
      assetPath: 'Sprites/missing.png',
    });

    expect(result.isError).toBe(true);
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain("Asset not found: 'Sprites/missing.png'");
  });

  it('lists entries with path importer and processor', async () => {
    const result = await handleManageContent({
      action: 'list',
      mgcbPath,
    });

    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('# MGCB Content Entries');
    expect(text).toContain('Sprites/player.png');
    expect(text).toContain('TextureImporter');
    expect(text).toContain('TextureProcessor');
  });

  it('returns project info with global properties', async () => {
    const result = await handleManageContent({
      action: 'info',
      mgcbPath,
    });

    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('# MGCB Project Info');
    expect(text).toContain('Platform: DesktopGL');
    expect(text).toContain('Output Directory: bin/$(Platform)');
    expect(text).toContain('Intermediate Directory: obj/$(Platform)');
  });

  it('returns file not found error for invalid mgcb path', async () => {
    const result = await handleManageContent({
      action: 'list',
      mgcbPath: path.join(tempDir, 'Missing.mgcb'),
    });

    expect(result.isError).toBe(true);
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('MGCB file not found');
  });

  it('returns error when add is missing assetPath', async () => {
    const result = await handleManageContent({
      action: 'add',
      mgcbPath,
    });

    expect(result.isError).toBe(true);
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    expect(text).toContain('assetPath is required for add action');
  });
});
