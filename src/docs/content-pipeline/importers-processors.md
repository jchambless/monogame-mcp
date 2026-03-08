# Importers and Processors

Importers read source files, and processors convert imported data into game-ready formats.

## Pipeline Architecture

```
Source File → Importer → Intermediate Object → Processor → .xnb File
```

## Built-in Importers

### TextureImporter

**Input**: `.png`, `.jpg`, `.bmp`, `.gif`, `.tga`, `.dds`  
**Output**: `TextureContent`

Imports 2D texture images.

### WavImporter

**Input**: `.wav`  
**Output**: `AudioFileContent`

Imports uncompressed WAV audio files.

### Mp3Importer / OggImporter / WmaImporter

**Input**: `.mp3`, `.ogg`, `.wma`  
**Output**: `AudioFileContent`

Imports compressed audio for streaming music.

### FontDescriptionImporter

**Input**: `.spritefont` (XML font description)  
**Output**: `FontDescription`

Imports font description files that reference system fonts.

### EffectImporter

**Input**: `.fx` (HLSL shader code)  
**Output**: `EffectContent`

Imports HLSL shader files.

### FbxImporter / XImporter

**Input**: `.fbx`, `.x`  
**Output**: `NodeContent`

Imports 3D models with meshes, materials, animations.

## Built-in Processors

### TextureProcessor

**Input**: `TextureContent`  
**Output**: `Texture2DContent`

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ColorKeyColor | Color | 255,0,255,255 | Transparent color |
| ColorKeyEnabled | bool | true | Enable color key transparency |
| GenerateMipmaps | bool | false | Generate mipmaps for scaling |
| PremultiplyAlpha | bool | true | Premultiply alpha channel |
| ResizeToPowerOfTwo | bool | false | Resize to power-of-two dimensions |
| MakeSquare | bool | false | Force square dimensions |
| TextureFormat | TextureProcessorOutputFormat | Color | Output format (Color, Dxt1, Dxt3, Dxt5) |

**Usage**:

```
#begin Textures/sprite.png
/importer:TextureImporter
/processor:TextureProcessor
/processorParam:ColorKeyEnabled=False
/processorParam:GenerateMipmaps=True
/processorParam:TextureFormat=Dxt5
/build:Textures/sprite.png
```

### SoundEffectProcessor

**Input**: `AudioFileContent`  
**Output**: `SoundEffectContent`

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Quality | ConversionQuality | Best | Compression quality (Best, Low, Medium) |

### SongProcessor

**Input**: `AudioFileContent`  
**Output**: `SongContent`

Processes audio files for streaming music playback. No parameters.

### FontDescriptionProcessor

**Input**: `FontDescription`  
**Output**: `SpriteFontContent`

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| PremultiplyAlpha | bool | true | Premultiply alpha |
| TextureFormat | TextureProcessorOutputFormat | Auto | Output format |

### EffectProcessor

**Input**: `EffectContent`  
**Output**: `CompiledEffectContent`

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| DebugMode | EffectProcessorDebugMode | Auto | Debug shader compilation |
| Defines | string | "" | Preprocessor defines |

### ModelProcessor

**Input**: `NodeContent`  
**Output**: `ModelContent`

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ColorKeyColor | Color | 255,0,255,255 | Transparent color for textures |
| ColorKeyEnabled | bool | true | Enable color key |
| GenerateMipmaps | bool | true | Generate mipmaps |
| GenerateTangentFrames | bool | false | Generate tangent frames |
| PremultiplyTextureAlpha | bool | true | Premultiply alpha |
| PremultiplyVertexColors | bool | true | Premultiply vertex colors |
| ResizeTexturesToPowerOfTwo | bool | false | Resize textures |
| RotationX | float | 0 | Rotate model (degrees) |
| RotationY | float | 0 | Rotate model (degrees) |
| RotationZ | float | 0 | Rotate model (degrees) |
| Scale | float | 1 | Scale model |
| SwapWindingOrder | bool | false | Reverse face winding |
| TextureFormat | TextureProcessorOutputFormat | Compressed | Output format |

## Custom Content Processors

You can create custom importers and processors:

```csharp
[ContentImporter(".custom", DefaultProcessor = "CustomProcessor", 
                 DisplayName = "Custom Importer")]
public class CustomImporter : ContentImporter<string>
{
    public override string Import(string filename, ContentImporterContext context)
    {
        return File.ReadAllText(filename);
    }
}

[ContentProcessor(DisplayName = "Custom Processor")]
public class CustomProcessor : ContentProcessor<string, string>
{
    public override string Process(string input, ContentProcessorContext context)
    {
        // Process the imported data
        return input.ToUpperInvariant();
    }
}
```

### Registering Custom Pipeline Extensions

1. Create a separate class library project
2. Reference `MonoGame.Framework.Content.Pipeline`
3. Build the project
4. Add reference in `.mgcb` file:

```
#-------------------------------- References --------------------------------#

/reference:../MyPipeline/bin/Debug/netstandard2.0/MyPipeline.dll
```

## Source

https://docs.monogame.net/articles/content_pipeline/custom_effects.html
