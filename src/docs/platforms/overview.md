# Platform Overview

MonoGame supports multiple platforms with a single codebase. Choose the right template for your target platforms.

## Platform Comparison

| Platform | Graphics API | OS Support | Deployment |
|----------|-------------|------------|------------|
| DesktopGL | OpenGL 3.3+ | Windows, Linux, macOS | Standalone executable |
| WindowsDX | DirectX 11 | Windows only | Standalone executable |
| Android | OpenGL ES | Android 5.0+ | APK/AAB (Google Play) |
| iOS | Metal/OpenGL ES | iOS 10.0+ | IPA (App Store) |

## Choosing a Platform Template

### Cross-Platform Desktop

**Use DesktopGL** for:
- Windows + Linux + macOS support
- Open-source preference
- Steam, itch.io, GOG distribution
- Maximum platform compatibility

**Project Template**:
```bash
dotnet new mgdesktopgl -n MyGame
```

### Windows-Only Desktop

**Use WindowsDX** for:
- Maximum Windows performance
- DirectX-specific features
- Windows Store publishing
- Xbox integration

**Project Template**:
```bash
dotnet new mgwindowsdx -n MyGame
```

### Mobile

**Use Android** for:
- Google Play Store
- Android phones/tablets
- Touch-based games

**Project Template**:
```bash
dotnet new mgandroid -n MyGame
```

**Use iOS** for:
- Apple App Store
- iPhone/iPad
- Apple Arcade consideration

**Project Template**:
```bash
dotnet new mgios -n MyGame
```

## Shared Code Architecture

MonoGame uses a shared code approach. Create separate projects for each platform that reference shared game code.

### Project Structure

```
MySolution/
├── MyGame.Core/             (Shared game code)
│   ├── Game1.cs
│   ├── Entities/
│   └── Systems/
├── MyGame.DesktopGL/        (Desktop launcher)
│   ├── Program.cs
│   └── MyGame.DesktopGL.csproj
├── MyGame.Android/          (Android launcher)
│   ├── Activity1.cs
│   └── MyGame.Android.csproj
└── MyGame.iOS/              (iOS launcher)
    ├── ViewController.cs
    └── MyGame.iOS.csproj
```

### Shared Project Setup

1. Create core library:
```bash
dotnet new classlib -n MyGame.Core
```

2. Add MonoGame reference to core:
```xml
<ItemGroup>
  <PackageReference Include="MonoGame.Framework.DesktopGL" Version="3.8.1.303" />
</ItemGroup>
```

3. Reference core from platform projects:
```xml
<ItemGroup>
  <ProjectReference Include="../MyGame.Core/MyGame.Core.csproj" />
</ItemGroup>
```

## Platform-Specific Code

```csharp
// Conditional compilation
#if WINDOWS
_graphics.PreferredBackBufferWidth = 1920;
_graphics.PreferredBackBufferHeight = 1080;
#elif ANDROID || IOS
_graphics.IsFullScreen = true;
#endif

// Runtime detection
if (OperatingSystem.IsWindows()) { }
else if (OperatingSystem.IsAndroid()) { }
```

## Input Considerations

| Input Type | Desktop | Android | iOS |
|------------|---------|---------|-----|
| Keyboard | ✓ | ✗ | ✗ |
| Mouse | ✓ | ✗ | ✗ |
| Touch | ✗ | ✓ | ✓ |
| Gamepad | ✓ | ✓ | ✓ |

Unified input system: Desktop uses keyboard/gamepad, mobile uses touch. Normalize movement vectors. Use `#if` directives for platform-specific code.

## Content Pipeline

Different platforms support different texture formats:

- **Desktop (OpenGL)**: Color
- **Windows DX**: Dxt5
- **Android**: Etc1
- **iOS**: PvrtcRgb4Bpp

## Testing Strategy

1. Develop on primary platform (usually DesktopGL)
2. Test on all platforms weekly
3. Test input/performance on actual devices
4. Thorough testing on all targets before release

## Distribution

| Platform | Stores |
|----------|--------|
| DesktopGL | Steam, itch.io, GOG, Epic Games Store |
| WindowsDX | Microsoft Store, Steam |
| Android | Google Play, Amazon Appstore |
| iOS | Apple App Store |

## Source

https://docs.monogame.net/articles/getting_started/index.html
