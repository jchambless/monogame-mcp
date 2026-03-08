/**
 * MonoGame Documentation Manifest
 * 
 * Structured metadata for all curated MonoGame documentation files.
 * Organized by category: API, Examples, Content Pipeline, and Platforms.
 */

export interface DocMetadata {
  path: string;
  title: string;
  namespace?: string;
  category: string;
  keywords: string[];
}

export const docs = {
  api: [
    { path: 'api/game.md', title: 'Game', namespace: 'Microsoft.Xna.Framework', category: 'Core', keywords: ['game', 'loop', 'lifecycle', 'initialize', 'update', 'draw'] },
    { path: 'api/spritebatch.md', title: 'SpriteBatch', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['sprite', 'batch', 'draw', 'render', '2d'] },
    { path: 'api/texture2d.md', title: 'Texture2D', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['texture', 'image', 'sprite', '2d', 'asset'] },
    { path: 'api/vector2.md', title: 'Vector2', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['vector', '2d', 'position', 'velocity', 'direction'] },
    { path: 'api/vector3.md', title: 'Vector3', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['vector', '3d', 'position', 'direction', 'rotation'] },
    { path: 'api/vector4.md', title: 'Vector4', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['vector', '4d', 'quaternion', 'color'] },
    { path: 'api/contentmanager.md', title: 'ContentManager', namespace: 'Microsoft.Xna.Framework.Content', category: 'Content', keywords: ['content', 'load', 'assets', 'xnb', 'pipeline'] },
    { path: 'api/graphicsdevice.md', title: 'GraphicsDevice', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['graphics', 'device', 'gpu', 'render', 'viewport'] },
    { path: 'api/keyboard.md', title: 'Keyboard', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['keyboard', 'input', 'keys', 'state'] },
    { path: 'api/keyboardstate.md', title: 'KeyboardState', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['keyboard', 'state', 'keys', 'pressed'] },
    { path: 'api/mouse.md', title: 'Mouse', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['mouse', 'input', 'cursor', 'click'] },
    { path: 'api/mousestate.md', title: 'MouseState', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['mouse', 'state', 'position', 'buttons'] },
    { path: 'api/gamepad.md', title: 'GamePad', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['gamepad', 'controller', 'input', 'xbox'] },
    { path: 'api/gamepadstate.md', title: 'GamePadState', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['gamepad', 'state', 'buttons', 'thumbsticks'] },
    { path: 'api/rectangle.md', title: 'Rectangle', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['rectangle', 'bounds', 'collision', 'area'] },
    { path: 'api/color.md', title: 'Color', namespace: 'Microsoft.Xna.Framework', category: 'Graphics', keywords: ['color', 'rgba', 'tint', 'palette'] },
    { path: 'api/matrix.md', title: 'Matrix', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['matrix', 'transform', 'rotation', 'scale', 'translation'] },
    { path: 'api/soundeffect.md', title: 'SoundEffect', namespace: 'Microsoft.Xna.Framework.Audio', category: 'Audio', keywords: ['sound', 'audio', 'sfx', 'play'] },
    { path: 'api/soundeffectinstance.md', title: 'SoundEffectInstance', namespace: 'Microsoft.Xna.Framework.Audio', category: 'Audio', keywords: ['sound', 'instance', 'volume', 'pitch', 'loop'] },
    { path: 'api/gametime.md', title: 'GameTime', namespace: 'Microsoft.Xna.Framework', category: 'Core', keywords: ['time', 'delta', 'elapsed', 'update'] },
    { path: 'api/point.md', title: 'Point', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['point', 'integer', 'position', 'coordinate'] },
    { path: 'api/mathhelper.md', title: 'MathHelper', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['math', 'lerp', 'clamp', 'utilities'] },
    { path: 'api/boundingbox.md', title: 'BoundingBox', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['bounding', 'box', 'collision', '3d', 'aabb'] },
    { path: 'api/boundingsphere.md', title: 'BoundingSphere', namespace: 'Microsoft.Xna.Framework', category: 'Math', keywords: ['bounding', 'sphere', 'collision', '3d', 'radius'] },
    { path: 'api/graphicsdevicemanager.md', title: 'GraphicsDeviceManager', namespace: 'Microsoft.Xna.Framework', category: 'Graphics', keywords: ['graphics', 'manager', 'resolution', 'fullscreen'] },
    { path: 'api/spritefont.md', title: 'SpriteFont', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['font', 'text', 'render', 'draw'] },
    { path: 'api/rendertarget2d.md', title: 'RenderTarget2D', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['render', 'target', 'texture', 'framebuffer', 'offscreen'] },
    { path: 'api/effect.md', title: 'Effect', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['effect', 'shader', 'hlsl', 'rendering'] },
    { path: 'api/basiceffect.md', title: 'BasicEffect', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['effect', 'basic', 'lighting', '3d', 'material'] },
    { path: 'api/blendstate.md', title: 'BlendState', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['blend', 'alpha', 'transparency', 'compositing'] },
    { path: 'api/samplerstate.md', title: 'SamplerState', namespace: 'Microsoft.Xna.Framework.Graphics', category: 'Graphics', keywords: ['sampler', 'texture', 'filtering', 'wrap'] },
    { path: 'api/song.md', title: 'Song', namespace: 'Microsoft.Xna.Framework.Media', category: 'Audio', keywords: ['song', 'music', 'audio', 'streaming'] },
    { path: 'api/mediaplayer.md', title: 'MediaPlayer', namespace: 'Microsoft.Xna.Framework.Media', category: 'Audio', keywords: ['media', 'player', 'music', 'playback'] },
    { path: 'api/keys.md', title: 'Keys', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['keys', 'enum', 'keyboard', 'input'] },
    { path: 'api/buttons.md', title: 'Buttons', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['buttons', 'enum', 'gamepad', 'controller'] },
    { path: 'api/touchpanel.md', title: 'TouchPanel', namespace: 'Microsoft.Xna.Framework.Input', category: 'Input', keywords: ['touch', 'mobile', 'gesture', 'input'] }
  ] as DocMetadata[],

  examples: [
    { path: 'examples/input-handling.md', title: 'Input Handling', category: 'Examples', keywords: ['input', 'keyboard', 'mouse', 'gamepad', 'example'] },
    { path: 'examples/sprite-rendering.md', title: 'Sprite Rendering', category: 'Examples', keywords: ['sprite', 'render', 'draw', 'texture', 'example'] },
    { path: 'examples/collision-detection.md', title: 'Collision Detection', category: 'Examples', keywords: ['collision', 'detection', 'physics', 'rectangle', 'example'] },
    { path: 'examples/audio-playback.md', title: 'Audio Playback', category: 'Examples', keywords: ['audio', 'sound', 'music', 'playback', 'example'] },
    { path: 'examples/content-loading.md', title: 'Content Loading', category: 'Examples', keywords: ['content', 'load', 'assets', 'pipeline', 'example'] },
    { path: 'examples/camera-system.md', title: 'Camera System', category: 'Examples', keywords: ['camera', 'viewport', 'transform', '2d', 'example'] },
    { path: 'examples/game-state-management.md', title: 'Game State Management', category: 'Examples', keywords: ['state', 'management', 'menu', 'screen', 'example'] }
  ] as DocMetadata[],

  contentPipeline: [
    { path: 'content-pipeline/overview.md', title: 'Content Pipeline Overview', category: 'Content Pipeline', keywords: ['pipeline', 'mgcb', 'content', 'xnb', 'overview'] },
    { path: 'content-pipeline/mgcb-format.md', title: 'MGCB File Format', category: 'Content Pipeline', keywords: ['mgcb', 'format', 'content', 'project'] },
    { path: 'content-pipeline/importers-processors.md', title: 'Importers and Processors', category: 'Content Pipeline', keywords: ['importer', 'processor', 'custom', 'pipeline'] },
    { path: 'content-pipeline/troubleshooting.md', title: 'Content Pipeline Troubleshooting', category: 'Content Pipeline', keywords: ['troubleshooting', 'errors', 'pipeline', 'debug'] }
  ] as DocMetadata[],

  platforms: [
    { path: 'platforms/overview.md', title: 'Platform Overview', category: 'Platforms', keywords: ['platform', 'cross-platform', 'overview', 'support'] },
    { path: 'platforms/desktopgl.md', title: 'DesktopGL Platform', category: 'Platforms', keywords: ['desktopgl', 'cross-platform', 'opengl', 'desktop'] },
    { path: 'platforms/windowsdx.md', title: 'WindowsDX Platform', category: 'Platforms', keywords: ['windowsdx', 'directx', 'windows', 'desktop'] },
    { path: 'platforms/android.md', title: 'Android Platform', category: 'Platforms', keywords: ['android', 'mobile', 'platform'] },
    { path: 'platforms/ios.md', title: 'iOS Platform', category: 'Platforms', keywords: ['ios', 'mobile', 'platform', 'apple'] }
  ] as DocMetadata[]
};

/**
 * Get all documentation paths
 */
export function getAllDocs(): DocMetadata[] {
  return [
    ...docs.api,
    ...docs.examples,
    ...docs.contentPipeline,
    ...docs.platforms
  ];
}

/**
 * Search documentation by keyword
 */
export function searchDocs(keyword: string): DocMetadata[] {
  const normalizedKeyword = keyword.toLowerCase();
  return getAllDocs().filter(doc => 
    doc.title.toLowerCase().includes(normalizedKeyword) ||
    doc.keywords.some(k => k.toLowerCase().includes(normalizedKeyword)) ||
    doc.namespace?.toLowerCase().includes(normalizedKeyword)
  );
}

/**
 * Get documentation by category
 */
export function getDocsByCategory(category: string): DocMetadata[] {
  return getAllDocs().filter(doc => doc.category === category);
}

/**
 * Get documentation by namespace
 */
export function getDocsByNamespace(namespace: string): DocMetadata[] {
  return getAllDocs().filter(doc => doc.namespace === namespace);
}
