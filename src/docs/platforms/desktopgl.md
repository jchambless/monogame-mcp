# DesktopGL Platform

Cross-platform desktop template using OpenGL. Runs on Windows, Linux, and macOS.

## Overview

**DesktopGL** is MonoGame's primary cross-platform template. It uses OpenGL for graphics rendering, making it compatible across all major desktop operating systems.

**Supported Platforms**:
- Windows 10/11 (x64, x86, ARM64)
- Linux (x64, ARM64)
- macOS 10.15+ (x64, Apple Silicon)

## Creating a DesktopGL Project

```bash
dotnet new mgdesktopgl -n MyGame
cd MyGame
dotnet build
dotnet run
```

## Project Structure

```
MyGame/
├── MyGame.csproj
├── Content/
│   └── Content.mgcb
├── Game1.cs
├── Program.cs
├── Icon.bmp
└── Icon.ico
```

## Requirements

### Windows

- .NET 8.0+ SDK
- Visual Studio 2022 or VS Code

### Linux

- .NET 8.0+ SDK
- OpenGL drivers
- Required packages (Ubuntu/Debian):
```bash
sudo apt-get install libsdl2-dev
```

### macOS

- .NET 8.0+ SDK
- Xcode Command Line Tools
- macOS 10.15 (Catalina) or later

## Graphics API

**Backend**: OpenGL 3.3+ / OpenGL ES 2.0

The DesktopGL platform uses:
- OpenGL on Windows/Linux
- OpenGL on older macOS (pre-Catalina)
- Metal via MoltenGL on modern macOS

## Input Support

- Keyboard
- Mouse
- Xbox Controllers (via SDL)
- Generic USB controllers

## Audio Support

- OGG Vorbis (recommended for music)
- WAV (recommended for sound effects)
- MP3 (Windows only, requires additional codecs on Linux/macOS)

## Deployment

### Windows

```bash
dotnet publish -c Release -r win-x64 --self-contained
```

Output: Single-file executable with all dependencies

### Linux

```bash
dotnet publish -c Release -r linux-x64 --self-contained
```

**Distribution**:
- AppImage
- Flatpak
- Snap
- Native package (.deb, .rpm)

### macOS

```bash
dotnet publish -c Release -r osx-x64 --self-contained
```

**App Bundle Creation**:

```bash
mkdir -p MyGame.app/Contents/MacOS
mkdir -p MyGame.app/Contents/Resources
cp -r bin/Release/net8.0/osx-x64/publish/* MyGame.app/Contents/MacOS/
cp Icon.icns MyGame.app/Contents/Resources/
```

Create `Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dict>
    <key>CFBundleName</key>
    <string>MyGame</string>
    <key>CFBundleExecutable</key>
    <string>MyGame</string>
    <key>CFBundleIconFile</key>
    <string>Icon</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
```

## Platform-Specific Code

```csharp
public Game1()
{
    _graphics = new GraphicsDeviceManager(this);
    
    // Platform detection
    if (OperatingSystem.IsWindows())
    {
        // Windows-specific settings
    }
    else if (OperatingSystem.IsLinux())
    {
        // Linux-specific settings
    }
    else if (OperatingSystem.IsMacOS())
    {
        // macOS-specific settings
    }
}
```

## Performance Considerations

- **V-Sync**: Enabled by default, disable for higher frame rates:
```csharp
_graphics.SynchronizeWithVerticalRetrace = false;
IsFixedTimeStep = false;
```

- **Texture Formats**: Use `Color` format for cross-platform compatibility
- **Shaders**: Test on all target platforms, OpenGL GLSL differs slightly

## Common Issues

### Linux: Missing SDL2

```bash
sudo apt-get install libsdl2-2.0-0
```

### macOS: App not opening

Sign the app bundle:
```bash
codesign --force --deep --sign - MyGame.app
```

### High DPI Scaling

```csharp
_graphics.PreferredBackBufferWidth = 1920;
_graphics.PreferredBackBufferHeight = 1080;
_graphics.HardwareModeSwitch = false; // Borderless fullscreen
```

## Advantages

- True cross-platform (one codebase for all desktops)
- Open-source graphics stack
- Best Linux/macOS support
- Active community support

## Source

https://docs.monogame.net/articles/getting_started/1_setting_up_your_development_environment_ubuntu.html
