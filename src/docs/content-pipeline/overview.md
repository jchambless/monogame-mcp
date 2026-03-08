# Content Pipeline Overview

The MonoGame Content Pipeline (MGCB) processes raw asset files into optimized `.xnb` format for runtime loading.

## What is the Content Pipeline?

The Content Pipeline transforms source assets (PNG, WAV, FBX, etc.) into platform-specific binary files that load faster and use less memory.

### Pipeline Flow

```
Source Assets → MGCB Tool → .xnb Files → ContentManager.Load()
(PNG, WAV, FX)  (Build)     (Optimized)  (Runtime)
```

## Why Use the Content Pipeline?

1. **Platform Optimization**: Converts textures to platform-specific formats
2. **Compression**: Reduces file sizes
3. **Faster Loading**: Pre-processed binary format loads faster than parsing source files
4. **Type Safety**: Strong typing at compile-time
5. **Dependency Tracking**: Rebuilds only changed assets

## MGCB Editor

The MGCB Editor is a visual tool for managing your `.mgcb` content project file.

### Opening MGCB Editor

```bash
# Windows
mgcb-editor Content.mgcb

# macOS/Linux
mgcb-editor-mac Content.mgcb
```

### Adding Assets

1. Right-click Content node → Add → Existing Item
2. Select your asset files (PNG, WAV, etc.)
3. Assets are copied to Content directory
4. Build the content project (F6)

## Content Types

| Source Format | MonoGame Type | Importer | Processor |
|---------------|---------------|----------|-----------|
| .png, .jpg, .bmp | Texture2D | TextureImporter | TextureProcessor |
| .wav | SoundEffect | WavImporter | SoundEffectProcessor |
| .mp3, .ogg, .wma | Song | Mp3Importer | SongProcessor |
| .spritefont | SpriteFont | FontDescriptionImporter | FontDescriptionProcessor |
| .fx | Effect | EffectImporter | EffectProcessor |
| .fbx, .x | Model | FbxImporter | ModelProcessor |

## Building Content

### Command Line

```bash
dotnet mgcb Content.mgcb
```

### Visual Studio Integration

Content is built automatically when you build your game project.

## Loading Content at Runtime

```csharp
protected override void LoadContent()
{
    // Path is relative to Content.RootDirectory, without extension
    Texture2D texture = Content.Load<Texture2D>("Textures/player");
    SoundEffect sound = Content.Load<SoundEffect>("Audio/explosion");
    SpriteFont font = Content.Load<SpriteFont>("Fonts/Arial");
}
```

## Content Organization

### Recommended Folder Structure

```
Content/
├── Textures/
│   ├── UI/
│   ├── Characters/
│   └── Environment/
├── Audio/
│   ├── SFX/
│   └── Music/
├── Fonts/
└── Shaders/
```

## Common Issues

### Asset Not Found

**Error**: `ContentLoadException: Asset not found`

**Solutions**:
- Verify asset was added to `.mgcb` file
- Check asset path matches exactly (case-sensitive)
- Ensure asset was built (check bin/Content for `.xnb` files)
- Verify `Content.RootDirectory` is set correctly

### Asset Not Rebuilding

**Solutions**:
- Clean and rebuild content project
- Delete `bin` and `obj` folders
- Check file modification times

## Alternatives to Content Pipeline

### Texture2D.FromStream

Load images directly without Content Pipeline:

```csharp
using (FileStream stream = File.OpenRead("image.png"))
{
    Texture2D texture = Texture2D.FromStream(GraphicsDevice, stream);
}
```

**Pros**: No build step, easier for dynamic content  
**Cons**: Slower loading, no platform optimization, larger file sizes

## Source

https://docs.monogame.net/articles/content_pipeline/index.html
