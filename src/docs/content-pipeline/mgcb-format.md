# MGCB File Format

The `.mgcb` file is a plain text file that defines your content project. It can be edited manually or through the MGCB Editor.

## File Structure

```
#----------------------------- Global Properties ----------------------------#

/outputDir:bin/$(Platform)
/intermediateDir:obj/$(Platform)
/platform:DesktopGL
/config:
/profile:Reach
/compress:False

#-------------------------------- References --------------------------------#


#---------------------------------- Content ---------------------------------#

#begin Textures/player.png
/importer:TextureImporter
/processor:TextureProcessor
/processorParam:ColorKeyColor=255,0,255,255
/processorParam:ColorKeyEnabled=True
/processorParam:GenerateMipmaps=False
/processorParam:PremultiplyAlpha=True
/processorParam:ResizeToPowerOfTwo=False
/processorParam:MakeSquare=False
/processorParam:TextureFormat=Color
/build:Textures/player.png
```

## Global Properties

### /outputDir

Output directory for compiled `.xnb` files.

**Default**: `bin/$(Platform)`

### /intermediateDir

Intermediate build files directory.

**Default**: `obj/$(Platform)`

### /platform

Target platform.

**Values**: `Windows`, `DesktopGL`, `Android`, `iOS`, `WindowsStoreApp`, `PlayStation4`, `XboxOne`

### /profile

Graphics feature level.

**Values**:
- `Reach`: Supports older hardware (shader model 2.0)
- `HiDef`: Requires modern hardware (shader model 3.0+)

### /compress

Enable LZ4 compression for `.xnb` files.

**Values**: `True`, `False`

## Content Blocks

Each asset in your project has a content block starting with `#begin`.

### Basic Content Block

```
#begin Audio/explosion.wav
/importer:WavImporter
/processor:SoundEffectProcessor
/processorParam:Quality=Best
/build:Audio/explosion.wav
```

### Required Fields

- `#begin <assetPath>`: Declares a new content item
- `/importer:<ImporterName>`: Specifies the importer to use
- `/processor:<ProcessorName>`: Specifies the processor to use
- `/build:<sourcePath>`: Source file path

### Optional Fields

- `/processorParam:<key>=<value>`: Processor parameters
- `/copy:<destination>`: Copy file instead of processing

## Common Importers

| Importer | Source Formats | Output Type |
|----------|----------------|-------------|
| TextureImporter | .png, .jpg, .bmp, .gif, .tga | Texture2D |
| WavImporter | .wav | SoundEffect |
| Mp3Importer | .mp3 | Song |
| OggImporter | .ogg | Song |
| WmaImporter | .wma | Song |
| FontDescriptionImporter | .spritefont | SpriteFont |
| EffectImporter | .fx | Effect |
| FbxImporter | .fbx | Model |

## Common Processors

### TextureProcessor

Parameters:
- `ColorKeyColor`: Transparent color (default: 255,0,255,255)
- `ColorKeyEnabled`: Enable color key transparency
- `GenerateMipmaps`: Generate mipmaps for scaling
- `PremultiplyAlpha`: Premultiply alpha channel
- `TextureFormat`: Color, Dxt1, Dxt3, Dxt5, Bgr565

### SoundEffectProcessor

Parameters:
- `Quality`: Best, Low, Medium

### FontDescriptionProcessor

Parameters:
- `PremultiplyAlpha`: Premultiply alpha
- `TextureFormat`: Auto, Color, Rgba1010102

## References

Add external content pipeline extensions:

```
#-------------------------------- References --------------------------------#

/reference:../MyContentPipeline/bin/Debug/MyContentPipeline.dll
```

## Manual Editing Tips

1. **Case Sensitivity**: Paths are case-sensitive on Linux/macOS
2. **Forward Slashes**: Use `/` for paths, even on Windows
3. **Rebuild**: Changes require rebuilding the content project
4. **Comments**: Lines starting with `#` are comments (except directives)

## Example: Complete MGCB File

```
#----------------------------- Global Properties ----------------------------#

/outputDir:bin/DesktopGL/Content
/intermediateDir:obj/DesktopGL/Content
/platform:DesktopGL
/config:
/profile:HiDef
/compress:True

#-------------------------------- References --------------------------------#


#---------------------------------- Content ---------------------------------#

#begin Textures/player.png
/importer:TextureImporter
/processor:TextureProcessor
/processorParam:ColorKeyEnabled=False
/processorParam:GenerateMipmaps=False
/processorParam:PremultiplyAlpha=True
/processorParam:TextureFormat=Color
/build:Textures/player.png

#begin Audio/explosion.wav
/importer:WavImporter
/processor:SoundEffectProcessor
/processorParam:Quality=Best
/build:Audio/explosion.wav

#begin Fonts/Arial.spritefont
/importer:FontDescriptionImporter
/processor:FontDescriptionProcessor
/build:Fonts/Arial.spritefont

#begin Music/background.ogg
/importer:OggImporter
/processor:SongProcessor
/build:Music/background.ogg
```

## Source

https://docs.monogame.net/articles/content_pipeline/using_mgcb.html
