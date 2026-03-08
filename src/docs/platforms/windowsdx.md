# WindowsDX Platform

Windows-only template using DirectX 11 for optimal Windows performance.

## Overview

**WindowsDX** (formerly Windows) is MonoGame's DirectX 11-based template. It provides the best performance on Windows with native DirectX support.

**Supported Platforms**:
- Windows 10/11 (x64, x86)
- Requires DirectX 11 compatible graphics card

## When to Use WindowsDX

**Use WindowsDX if**:
- Targeting Windows only
- Need maximum Windows performance
- Require DirectX-specific features
- Shipping on Windows Store

**Use DesktopGL if**:
- Need cross-platform support
- Targeting Linux/macOS
- Open-source stack preference

## Creating a WindowsDX Project

```bash
dotnet new mgwindowsdx -n MyGame
cd MyGame
dotnet build
dotnet run
```

## Requirements

- .NET 8.0+ SDK
- Windows 10/11
- Visual Studio 2022 (recommended)
- DirectX 11 capable GPU

## Graphics API

**Backend**: DirectX 11

**Supported Features**:
- Hardware instancing
- Compute shaders
- Geometry shaders
- All DirectX 11 texture formats
- Better multi-threading support than OpenGL

## Input Support

- Keyboard
- Mouse
- Xbox Controllers (native XInput support)
- DirectInput controllers

## Audio Support

- XAudio2 backend
- WAV (recommended for sound effects)
- WMA (native support)
- MP3 (native support)
- OGG Vorbis (via codec)

## Deployment

### Standalone Executable

```bash
dotnet publish -c Release -r win-x64 --self-contained
```

**Output**: `bin/Release/net8.0/win-x64/publish/`

### Framework-Dependent

```bash
dotnet publish -c Release
```

Requires .NET Runtime on target machine.

### Windows Store

WindowsDX can target UWP/Windows Store:

1. Add UWP target framework
2. Update manifest
3. Package with Visual Studio

## Platform-Specific Features

### DirectX Specifics

```csharp
// Access DirectX device
var dxDevice = (SharpDX.Direct3D11.Device)GraphicsDevice.Handle;

// DirectX-specific texture formats
TextureFormat.Dxt1
TextureFormat.Dxt3
TextureFormat.Dxt5
TextureFormat.BC7
```

### Xbox Controller Vibration

Better vibration support than DesktopGL:

```csharp
GamePad.SetVibration(PlayerIndex.One, 1.0f, 1.0f);
```

### High DPI Support

```csharp
[System.STAThread]
static void Main()
{
    // Enable DPI awareness
    NativeMethods.SetProcessDPIAware();
    
    using (var game = new Game1())
        game.Run();
}
```

## Content Pipeline

Same as DesktopGL, but supports additional texture formats:

```
/processorParam:TextureFormat=Dxt5
/processorParam:TextureFormat=BC7
```

## Performance Optimization

### Use Compressed Textures

```
#begin Textures/background.png
/processorParam:TextureFormat=Dxt5
/build:Textures/background.png
```

### Enable Multi-threading

DirectX 11 supports better multi-threading than OpenGL:

```csharp
_graphics.PreferMultiSampling = true;
```

### Buffer Management

```csharp
// More efficient on DirectX
GraphicsDevice.SetVertexBuffer(vertexBuffer);
GraphicsDevice.SetIndexBuffer(indexBuffer);
GraphicsDevice.DrawIndexedPrimitives(
    PrimitiveType.TriangleList, 0, 0, indexBuffer.IndexCount / 3);
```

## Advantages

- Best Windows performance
- Native DirectX integration
- Better shader tooling (fxc compiler)
- Xbox controller native support
- Windows-specific features (Xbox Live, etc.)

## Disadvantages

- Windows-only
- Larger dependency footprint
- Closed-source graphics stack
- No Linux/macOS support

## Common Issues

### DirectX Runtime Error

**Error**: `SharpDX.SharpDXException: HRESULT: [0x887A0001]`

**Solution**: Update graphics drivers

### Missing DirectX DLLs

Install DirectX End-User Runtime:
https://www.microsoft.com/en-us/download/details.aspx?id=35

### Fullscreen Issues

```csharp
_graphics.IsFullScreen = true;
_graphics.HardwareModeSwitch = false; // Use borderless window
_graphics.ApplyChanges();
```

## Migration from WindowsDX to DesktopGL

1. Change project template
2. Update texture formats (remove Dxt formats)
3. Test input on OpenGL
4. Recompile shaders for GLSL
5. Test on target platform

## Source

https://docs.monogame.net/articles/getting_started/1_setting_up_your_development_environment_windows.html
