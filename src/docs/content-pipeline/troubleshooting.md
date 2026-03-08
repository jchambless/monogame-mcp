# Content Pipeline Troubleshooting

Common errors, solutions, and debugging tips for the MonoGame Content Pipeline.

## Asset Not Found Errors

### Error: ContentLoadException - Could not find asset

```
Microsoft.Xna.Framework.Content.ContentLoadException: 
Could not find ContentTypeReader for Textures/player
```

**Causes**:
1. Asset wasn't added to `.mgcb` file
2. Asset path is incorrect or case-sensitive
3. Asset wasn't built (missing `.xnb` file)
4. Wrong `Content.RootDirectory`

**Solutions**:

```csharp
// Check Content.RootDirectory matches your structure
Content.RootDirectory = "Content";

// Path is relative to RootDirectory, no extension
Texture2D texture = Content.Load<Texture2D>("Textures/player");

// Verify .xnb exists: bin/DesktopGL/Content/Textures/player.xnb
```

**Debug Steps**:
1. Open MGCB Editor and verify asset is listed
2. Build content project manually: `dotnet mgcb Content.mgcb`
3. Check `bin/Platform/Content/` for `.xnb` files
4. Verify path matches exactly (case matters on Linux/macOS)

## Build Errors

### Error: Processor could not be created

```
error MGCB: Processor 'TextureProcessor' could not be created
```

**Cause**: Missing or incorrect processor name

**Solution**: Use correct processor name from available list:
- TextureProcessor
- SoundEffectProcessor  
- SongProcessor
- FontDescriptionProcessor
- EffectProcessor
- ModelProcessor

### Error: Importer could not process file

```
error MGCB: Importer 'TextureImporter' had unexpected failure
```

**Causes**:
1. Corrupted source file
2. Unsupported file format
3. File locked by another process

**Solutions**:
- Re-export asset from source application
- Verify file format is supported
- Close programs that might have file open
- Try different image format (PNG is most reliable)

## Font Errors

### Error: Could not find font 'Arial'

```
error MGCB: Failed to import 'Fonts/Arial.spritefont': 
Could not load Arial font
```

**Causes**:
- Font not installed on build machine
- Font name incorrect in `.spritefont` file

**Solutions**:

1. Verify font is installed on your system
2. Check `.spritefont` file font name:

```xml
<?xml version="1.0" encoding="utf-8"?>
<XnaContent>
  <Asset Type="Graphics:FontDescription">
    <FontName>Arial</FontName>
    <Size>14</Size>
    <!-- ... -->
  </Asset>
</XnaContent>
```

3. Use a common font (Arial, Courier New, Times New Roman)
4. Include font file with your project and reference by filename

## Texture Format Errors

### Error: Surface format not supported

```
error MGCB: Texture format 'Dxt5' is not supported on this platform
```

**Cause**: Target platform doesn't support requested format

**Solution**: Change `TextureFormat` parameter:

```
/processorParam:TextureFormat=Color
```

**Format Compatibility**:
- `Color`: All platforms
- `Dxt1/Dxt3/Dxt5`: Desktop only
- `Pvrtc`: iOS only
- `Etc1`: Android only

## Shader Compilation Errors

### Error: Effect compilation failed

```
error MGCB: Failed to build 'Shaders/custom.fx':
Compilation failed - Syntax error
```

**Causes**:
1. HLSL syntax errors
2. Unsupported shader model
3. Missing technique/pass

**Solutions**:

1. Validate HLSL syntax
2. Use compatible shader model:
   - `Reach`: shader model 2.0
   - `HiDef`: shader model 3.0+

```hlsl
// Basic effect structure
technique BasicEffect
{
    pass Pass1
    {
        VertexShader = compile vs_3_0 VertexShaderFunction();
        PixelShader = compile ps_3_0 PixelShaderFunction();
    }
}
```

## Platform-Specific Issues

### iOS Build Errors

**Error**: Assets not found on device

**Cause**: Case-sensitive file system

**Solution**: Ensure all paths match case exactly:
```csharp
// Wrong on iOS (if file is Player.png)
Content.Load<Texture2D>("Textures/player");

// Correct
Content.Load<Texture2D>("Textures/Player");
```

### Android Build Errors

**Error**: Content files not included in APK

**Solution**: Set Build Action to `AndroidAsset` for `.xnb` files

## Performance Issues

### Long Build Times

**Solutions**:
1. Enable compression only for release builds
2. Use incremental builds (only rebuild changed assets)
3. Reduce texture sizes
4. Disable mipmap generation when not needed

### Large File Sizes

**Solutions**:

1. Enable compression:
```
/compress:True
```

2. Use compressed texture formats:
```
/processorParam:TextureFormat=Dxt5
```

3. Reduce texture dimensions
4. Use appropriate audio quality:
```
/processorParam:Quality=Medium
```

## Debugging Tips

### Enable Verbose Output

```bash
dotnet mgcb Content.mgcb /quiet:False
```

### Check Intermediate Files

Look in `obj/Platform/Content/` for intermediate build files to debug importer issues.

### Manual Content Build

```bash
# Build specific file
dotnet mgcb Content.mgcb /rebuild Textures/player.png

# Clean all content
dotnet mgcb Content.mgcb /clean

# Full rebuild
dotnet mgcb Content.mgcb /rebuild
```

### Verify Content Type

```csharp
try
{
    Texture2D texture = Content.Load<Texture2D>("Textures/player");
    Console.WriteLine($"Loaded: {texture.Width}x{texture.Height}");
}
catch (ContentLoadException ex)
{
    Console.WriteLine($"Failed to load: {ex.Message}");
}
```

## Common Workflow Issues

### Asset Changes Not Appearing

**Solutions**:
1. Clean and rebuild content project
2. Delete `bin` and `obj` folders
3. Restart IDE
4. Check file modification times

### Missing Content After Deployment

**Checklist**:
- [ ] All `.xnb` files copied to output directory
- [ ] `Content.RootDirectory` set correctly
- [ ] Content folder structure preserved
- [ ] Platform-specific content built for target platform

## Source

Based on MonoGame community troubleshooting guides and documentation.
