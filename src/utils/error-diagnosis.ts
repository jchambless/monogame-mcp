/**
 * MonoGame Error Diagnosis Utility
 * 
 * Matches error messages against known MonoGame error patterns and returns
 * structured diagnosis information including cause, solution steps, and
 * documentation links.
 */

import type { ErrorPattern } from '../types.js';

/**
 * Error diagnosis result interface.
 * Returned when an error pattern matches the input error message.
 */
export interface ErrorDiagnosis {
  pattern: string;           // Pattern name/description that matched
  errorType: string;         // Category (e.g., "Content Loading", "Graphics", "Build")
  cause: string;             // Likely root cause
  solution: string[];        // Step-by-step solution
  docLinks: string[];        // Links to relevant documentation
}

/**
 * Database of known MonoGame error patterns.
 * Each pattern includes regex for matching, error categorization,
 * and structured guidance for resolution.
 */
const ERROR_PATTERNS: ErrorPattern[] = [
  // Content Loading Errors
  {
    regex: /Content.*not find.*ContentTypeReader|Could not find.*asset/i,
    errorType: 'Content Loading',
    description: 'Content file not found',
    cause: 'Asset not found in content pipeline output. Common causes: incorrect path, asset not added to .mgcb file, asset not built, wrong Content.RootDirectory, or case-sensitive path mismatch.',
    solution: `1. Verify Content.RootDirectory is set correctly (usually "Content")
2. Check asset path matches the path in .mgcb file exactly
3. Ensure content was built successfully - check bin/<Platform>/Content/ for .xnb files
4. Verify Content.Load path does not include file extension
5. Check case sensitivity (matters on Linux/macOS)
6. Open MGCB Editor and verify asset is listed`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'file://src/docs/api/contentmanager.md',
      'https://docs.monogame.net/articles/getting_to_know/howto/content/index.html',
    ],
  },
  {
    regex: /Could not load.*asset|ContentLoadException/i,
    errorType: 'Content Loading',
    description: 'Asset loading failure',
    cause: 'Failed to load content asset. Could be corrupted .xnb file, incompatible format, or content pipeline build failure.',
    solution: `1. Rebuild content project: dotnet mgcb Content.mgcb /rebuild
2. Delete bin and obj folders and rebuild
3. Check content build output for errors
4. Verify source asset file is not corrupted
5. Try re-exporting asset from source application
6. Check that importer/processor are correct for file type`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'https://docs.monogame.net/articles/content_pipeline/index.html',
    ],
  },

  // SpriteBatch Lifecycle Errors
  {
    regex: /Begin must be called before Draw/i,
    errorType: 'Graphics Lifecycle',
    description: 'SpriteBatch.Begin not called before Draw',
    cause: 'SpriteBatch.Draw() called without calling Begin() first. Every Begin() must be followed by End(), and Draw calls must be between them.',
    solution: `1. Ensure SpriteBatch.Begin() is called before any Draw calls
2. Check that Begin/End pairs are properly matched
3. Verify you\'re not calling Draw outside the Begin/End block
4. Common pattern: spriteBatch.Begin() → Draw calls → spriteBatch.End()
5. Check for early returns that skip End() call`,
    docLinks: [
      'file://src/docs/api/spritebatch.md',
      'https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.SpriteBatch.html',
    ],
  },
  {
    regex: /End must be called before Begin/i,
    errorType: 'Graphics Lifecycle',
    description: 'SpriteBatch.End not called after previous Begin',
    cause: 'SpriteBatch.Begin() called twice without End() in between. Each Begin() must be paired with exactly one End().',
    solution: `1. Ensure every Begin() has a matching End() call
2. Check for multiple Begin() calls without End() between them
3. Use try-finally to ensure End() is called even if exception occurs
4. Verify control flow doesn\'t skip End() call
5. Common pattern: Begin() → Draw calls → End() (repeat)`,
    docLinks: [
      'file://src/docs/api/spritebatch.md',
      'https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.SpriteBatch.html',
    ],
  },

  // GraphicsDevice Errors
  {
    regex: /GraphicsDevice.*must not be null|GraphicsDevice.*not.*initialized/i,
    errorType: 'Graphics Initialization',
    description: 'GraphicsDevice not initialized',
    cause: 'Attempting to use GraphicsDevice before it\'s initialized. GraphicsDevice is not available in the Game constructor or before Initialize() is called.',
    solution: `1. Move GraphicsDevice-dependent code to LoadContent() or later
2. Don\'t create textures or graphics resources in constructor
3. Ensure Initialize() has been called before using GraphicsDevice
4. Check that you\'re not accessing GraphicsDevice in field initializers
5. Use GraphicsDeviceManager.ApplyChanges() if changing graphics settings`,
    docLinks: [
      'file://src/docs/api/graphicsdevice.md',
      'https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.GraphicsDevice.html',
    ],
  },
  {
    regex: /No suitable graphics.*found|NoSuitableGraphicsDeviceException/i,
    errorType: 'Graphics Hardware',
    description: 'No compatible graphics device found',
    cause: 'GPU or graphics drivers incompatible with requested graphics profile (HiDef/Reach). Common on systems with old GPUs or missing/outdated drivers.',
    solution: `1. Update graphics drivers to latest version
2. Switch graphics profile from HiDef to Reach in game constructor
3. Check GPU supports DirectX 10+ (HiDef) or DirectX 9+ (Reach)
4. Verify graphics card is not disabled in device manager
5. Try DesktopGL platform instead of WindowsDX
6. Code: graphicsDeviceManager.GraphicsProfile = GraphicsProfile.Reach;`,
    docLinks: [
      'file://src/docs/api/graphicsdevice.md',
      'https://docs.monogame.net/articles/getting_to_know/whatis/graphics_profiles.html',
    ],
  },

  // Shader Errors
  {
    regex: /Effect compilation failed|Shader.*compil.*fail/i,
    errorType: 'Shader Compilation',
    description: 'Shader compilation error',
    cause: 'HLSL shader code has syntax errors, uses unsupported features, or targets wrong shader model. Reach profile supports shader model 2.0, HiDef supports 3.0+.',
    solution: `1. Check HLSL syntax errors in shader code
2. Verify shader model compatibility: vs_2_0/ps_2_0 (Reach), vs_3_0/ps_3_0+ (HiDef)
3. Ensure technique and pass are properly defined
4. Check that shader uses supported instructions
5. Use fxc.exe to compile shader manually for detailed errors
6. Verify EffectProcessor is selected in MGCB Editor`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'https://docs.monogame.net/articles/getting_to_know/howto/content/effects.html',
    ],
  },

  // Object Disposal Errors
  {
    regex: /Cannot access a disposed object|ObjectDisposedException/i,
    errorType: 'Object Lifecycle',
    description: 'Disposed object access',
    cause: 'Attempting to use a texture, effect, or other graphics resource after it has been disposed. Common when disposing resources too early or using them after game exit.',
    solution: `1. Don\'t dispose resources that are still in use
2. Check for accidental double-dispose
3. Ensure resources aren\'t disposed before game ends
4. Use using statements carefully - they auto-dispose at block end
5. Don\'t manually dispose resources managed by ContentManager
6. Check for race conditions in multi-threaded code`,
    docLinks: [
      'file://src/docs/api/contentmanager.md',
      'https://docs.monogame.net/articles/getting_to_know/howto/content/index.html',
    ],
  },

  // Content Pipeline Build Errors
  {
    regex: /content importer.*could not be found|importer.*not.*found/i,
    errorType: 'Content Pipeline',
    description: 'Content importer not found',
    cause: 'MGCB can\'t find the specified importer. Importer name might be incorrect, or required content pipeline extension is not installed.',
    solution: `1. Verify importer name is correct (e.g., TextureImporter, Mp3Importer)
2. Check if custom importer requires pipeline extension to be installed
3. Ensure content pipeline references are correct in .mgcb file
4. For custom importers, verify DLL is in correct location
5. Try resetting importer to default in MGCB Editor
6. Rebuild content pipeline extensions if using custom importers`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'https://docs.monogame.net/articles/content_pipeline/custom_effects.html',
    ],
  },
  {
    regex: /content processor.*could not be found|processor.*not.*found/i,
    errorType: 'Content Pipeline',
    description: 'Content processor not found',
    cause: 'MGCB can\'t find the specified processor. Processor name might be incorrect, or required content pipeline extension is not installed.',
    solution: `1. Verify processor name is correct (e.g., TextureProcessor, SoundEffectProcessor)
2. Check if custom processor requires pipeline extension
3. Ensure /reference: paths in .mgcb file are correct
4. For custom processors, verify DLL is in correct location
5. Try resetting processor to default in MGCB Editor
6. Common processors: TextureProcessor, SoundEffectProcessor, SongProcessor, FontDescriptionProcessor`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'https://docs.monogame.net/articles/content_pipeline/index.html',
    ],
  },
  {
    regex: /Error loading pipeline assembly|Could not load.*pipeline/i,
    errorType: 'Content Pipeline',
    description: 'Pipeline assembly loading error',
    cause: 'Failed to load content pipeline extension DLL. Assembly might be missing, corrupted, or targeting wrong .NET version.',
    solution: `1. Verify pipeline extension DLL exists at referenced path
2. Check DLL targets compatible .NET version
3. Ensure all dependencies of pipeline extension are available
4. Try rebuilding pipeline extension from source
5. Check /reference: paths are correct in .mgcb file
6. Verify DLL is not blocked (right-click → Properties → Unblock)`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'https://docs.monogame.net/articles/content_pipeline/custom_effects.html',
    ],
  },

  // Texture Format Errors
  {
    regex: /Texture format.*not supported|Surface format.*not supported/i,
    errorType: 'Texture Format',
    description: 'Texture format not supported on platform',
    cause: 'Requested texture format (e.g., DXT5, PVRTC) is not supported on target platform. Different platforms support different compression formats.',
    solution: `1. Change TextureFormat processor parameter to "Color" for universal support
2. Platform compatibility: Color (all), Dxt1/3/5 (desktop only), Pvrtc (iOS), Etc1 (Android)
3. Edit .mgcb file or use MGCB Editor to change /processorParam:TextureFormat=Color
4. Consider platform-specific content builds for optimal compression
5. Uncompressed "Color" format works everywhere but uses more memory`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'https://docs.monogame.net/articles/getting_to_know/howto/content/adding_ttf_fonts.html',
    ],
  },

  // Array/Index Errors
  {
    regex: /Index.*outside.*bounds|IndexOutOfRangeException/i,
    errorType: 'Array Access',
    description: 'Array index out of bounds',
    cause: 'Attempting to access array element with invalid index. Common in sprite sheet calculations, texture data access, or vertex buffers.',
    solution: `1. Verify array indices are within valid range (0 to length-1)
2. Check sprite sheet math: ensure source rectangles fit within texture bounds
3. Add bounds checking before array access
4. Verify texture dimensions match expected values
5. Check for off-by-one errors in loops
6. Debug: print array length and index being accessed`,
    docLinks: [
      'https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.Texture2D.html',
    ],
  },

  // Audio Errors
  {
    regex: /SoundEffect.*failed|NoAudioHardwareException|audio.*not available/i,
    errorType: 'Audio',
    description: 'Audio playback failure',
    cause: 'No audio hardware available, audio drivers not installed, or audio device disabled. Also occurs if too many sounds playing simultaneously.',
    solution: `1. Verify audio device is enabled in system settings
2. Update or reinstall audio drivers
3. Check that speakers/headphones are connected
4. Reduce number of simultaneous sound effects (limit ~16-32)
5. Try different audio format (WAV vs MP3)
6. Check SoundEffect.MasterVolume is not zero
7. Verify content was built with SoundEffectProcessor`,
    docLinks: [
      'https://docs.monogame.net/api/Microsoft.Xna.Framework.Audio.SoundEffect.html',
    ],
  },
  {
    regex: /MediaPlayer.*failed|Song.*play.*failed/i,
    errorType: 'Audio',
    description: 'Music playback failure',
    cause: 'Song format not supported on platform, or media player unavailable. Android/iOS have more restrictions on music formats than desktop.',
    solution: `1. Use platform-appropriate formats: MP3 (desktop), OGG (cross-platform)
2. Verify song was built with SongProcessor
3. Check MediaPlayer.State before playing
4. Ensure only one song plays at a time
5. Try MediaPlayer.Play() with isRepeating parameter
6. Check file is not corrupted or DRM-protected`,
    docLinks: [
      'https://docs.monogame.net/api/Microsoft.Xna.Framework.Media.MediaPlayer.html',
    ],
  },

  // Platform/Window Errors
  {
    regex: /GameWindow.*Handle.*not available/i,
    errorType: 'Platform',
    description: 'Window handle not available',
    cause: 'Attempting to access GameWindow.Handle before window is created, or on platform that doesn\'t expose window handle.',
    solution: `1. Access Window.Handle only after Initialize() is called
2. Check platform supports window handles (desktop platforms only)
3. Don\'t access Handle in Game constructor
4. Verify you\'re not on platform without window concept (e.g., certain mobile configs)
5. Use Window.ClientBounds instead if just need dimensions`,
    docLinks: [
      'https://docs.monogame.net/api/Microsoft.Xna.Framework.GameWindow.html',
    ],
  },

  // NullReference Errors
  {
    regex: /Object reference not set|NullReferenceException/i,
    errorType: 'Null Reference',
    description: 'Null reference exception',
    cause: 'Attempting to use an object that is null. Common causes: uninitialized game objects, resources not loaded, or accessing disposed objects.',
    solution: `1. Initialize all objects before using them
2. Load content in LoadContent() method, not constructor
3. Check for null before accessing objects: if (obj != null)
4. Use null-conditional operator: obj?.Method()
5. Verify Initialize() and LoadContent() have been called
6. Check for typos in Content.Load asset names
7. Debug: add null checks and log which object is null`,
    docLinks: [
      'https://docs.monogame.net/articles/getting_started/index.html',
    ],
  },

  // Template/Project Setup Errors
  {
    regex: /Could not find.*template|No templates.*found matching/i,
    errorType: 'Project Setup',
    description: 'MonoGame templates not installed',
    cause: 'MonoGame project templates are not installed or outdated. Required for creating new MonoGame projects with "dotnet new".',
    solution: `1. Install MonoGame templates: dotnet new install MonoGame.Templates.CSharp
2. Verify installation: dotnet new list | findstr MonoGame
3. Update templates if outdated: dotnet new update
4. Ensure .NET SDK is installed (version 6.0 or later)
5. Try uninstalling and reinstalling: dotnet new uninstall MonoGame.Templates.CSharp
6. Available templates: mgdesktopgl, mgwindowsdx, mgandroid, mgios, mgshared`,
    docLinks: [
      'https://docs.monogame.net/articles/getting_started/1_setting_up_your_development_environment.html',
    ],
  },

  // MGCB Build Errors
  {
    regex: /MGCB.*Error|error MGCB:/i,
    errorType: 'Content Pipeline',
    description: 'MGCB build error',
    cause: 'Content pipeline build failed. Could be various causes: corrupted asset files, incorrect settings, missing importers, or file access issues.',
    solution: `1. Check full error message for specific cause
2. Rebuild content: dotnet mgcb Content.mgcb /rebuild
3. Enable verbose output: dotnet mgcb Content.mgcb /quiet:False
4. Check intermediate files in obj/<Platform>/Content/
5. Verify source asset files are not corrupted
6. Clean build: delete bin and obj folders, rebuild
7. Check file permissions and paths`,
    docLinks: [
      'file://src/docs/content-pipeline/troubleshooting.md',
      'https://docs.monogame.net/articles/content_pipeline/index.html',
    ],
  },

  // Memory Errors
  {
    regex: /OutOfMemoryException.*texture|memory.*texture|texture.*too large/i,
    errorType: 'Memory',
    description: 'Out of memory loading textures',
    cause: 'Texture too large, too many textures loaded, or memory leak. Uncompressed textures use 4 bytes per pixel (e.g., 4096x4096 = 64MB).',
    solution: `1. Reduce texture dimensions (e.g., 4096→2048, 2048→1024)
2. Use texture compression (DXT on desktop, platform-specific on mobile)
3. Unload unused content: Content.Unload()
4. Dispose textures when no longer needed
5. Use texture atlases to reduce total texture count
6. Check for memory leaks: are you creating new textures every frame?
7. Profile memory usage to identify large allocations`,
    docLinks: [
      'file://src/docs/api/contentmanager.md',
      'https://docs.monogame.net/articles/getting_to_know/howto/content/index.html',
    ],
  },

  // Recursive Call Errors
  {
    regex: /StackOverflowException/i,
    errorType: 'Stack Overflow',
    description: 'Stack overflow exception',
    cause: 'Infinite recursion, often in Update() or Draw() methods. Can occur if game loop methods incorrectly call base.Update() or base.Draw() multiple times, or recursive content loading.',
    solution: `1. Check for infinite recursion in Update/Draw methods
2. Don\'t call base.Update() or base.Draw() more than once
3. Verify you\'re not loading content recursively
4. Check for circular references in game objects
5. Use debugger to see call stack when exception occurs
6. Common mistake: calling Update() or Draw() manually within itself`,
    docLinks: [
      'https://docs.monogame.net/articles/getting_started/index.html',
    ],
  },
];

/**
 * Diagnose an error message by matching against known MonoGame error patterns.
 * 
 * @param errorMessage - The error message to diagnose
 * @returns ErrorDiagnosis if a pattern matches, null if no pattern matches
 * 
 * @example
 * ```typescript
 * const diagnosis = diagnoseError('ContentLoadException: Could not find asset');
 * if (diagnosis) {
 *   console.error(`Error Type: ${diagnosis.errorType}`);
 *   console.error(`Cause: ${diagnosis.cause}`);
 *   diagnosis.solution.forEach(step => console.error(`- ${step}`));
 * }
 * ```
 */
export function diagnoseError(errorMessage: string): ErrorDiagnosis | null {
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.regex.test(errorMessage)) {
      return {
        pattern: pattern.description,
        errorType: pattern.errorType,
        cause: pattern.cause,
        solution: pattern.solution.split('\n').filter(line => line.trim()),
        docLinks: pattern.docLinks,
      };
    }
  }
  return null;
}

/**
 * List all known error patterns.
 * Useful for debugging or displaying available pattern information.
 * 
 * @returns Array of all ErrorPattern objects
 * 
 * @example
 * ```typescript
 * const patterns = listErrorPatterns();
 * console.error(`Total patterns: ${patterns.length}`);
 * patterns.forEach(p => console.error(`- ${p.description} (${p.errorType})`));
 * ```
 */
export function listErrorPatterns(): ErrorPattern[] {
  return [...ERROR_PATTERNS];
}
