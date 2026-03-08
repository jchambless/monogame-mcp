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

### Conditional Compilation

```csharp
public Game1()
{
    _graphics = new GraphicsDeviceManager(this);
    
    #if WINDOWS
    _graphics.PreferredBackBufferWidth = 1920;
    _graphics.PreferredBackBufferHeight = 1080;
    #elif ANDROID || IOS
    _graphics.IsFullScreen = true;
    #endif
}
```

### Runtime Detection

```csharp
if (OperatingSystem.IsWindows())
{
    // Windows-specific code
}
else if (OperatingSystem.IsLinux())
{
    // Linux-specific code
}
else if (OperatingSystem.IsMacOS())
{
    // macOS-specific code
}
else if (OperatingSystem.IsAndroid())
{
    // Android-specific code
}
else if (OperatingSystem.IsIOS())
{
    // iOS-specific code
}
```

## Input Considerations

| Input Type | Desktop | Android | iOS |
|------------|---------|---------|-----|
| Keyboard | ✓ | ✗ | ✗ |
| Mouse | ✓ | ✗ | ✗ |
| Touch | ✗ | ✓ | ✓ |
| Gamepad | ✓ | ✓ | ✓ |
| Accelerometer | ✗ | ✓ | ✓ |

### Unified Input System

```csharp
public Vector2 GetMovementInput()
{
    Vector2 movement = Vector2.Zero;
    
    // Desktop: Keyboard/Gamepad
    #if !ANDROID && !IOS
    KeyboardState keyState = Keyboard.GetState();
    if (keyState.IsKeyDown(Keys.W)) movement.Y -= 1;
    if (keyState.IsKeyDown(Keys.S)) movement.Y += 1;
    if (keyState.IsKeyDown(Keys.A)) movement.X -= 1;
    if (keyState.IsKeyDown(Keys.D)) movement.X += 1;
    
    GamePadState padState = GamePad.GetState(PlayerIndex.One);
    if (padState.IsConnected)
        movement = padState.ThumbSticks.Left;
    #endif
    
    // Mobile: Touch
    #if ANDROID || IOS
    TouchCollection touches = TouchPanel.GetState();
    if (touches.Count > 0)
    {
        // Virtual joystick logic
        movement = CalculateVirtualJoystick(touches[0].Position);
    }
    #endif
    
    if (movement != Vector2.Zero)
        movement.Normalize();
    
    return movement;
}
```

## Content Pipeline Considerations

Different platforms support different texture formats:

```xml
<!-- Desktop (OpenGL) -->
<ProcessorParam Name="TextureFormat">Color</ProcessorParam>

<!-- Windows DX -->
<ProcessorParam Name="TextureFormat">Dxt5</ProcessorParam>

<!-- Android -->
<ProcessorParam Name="TextureFormat">Etc1</ProcessorParam>

<!-- iOS -->
<ProcessorParam Name="TextureFormat">PvrtcRgb4Bpp</ProcessorParam>
```

## Testing Strategy

1. **Primary Platform**: Develop on your main target (usually DesktopGL)
2. **Regular Testing**: Test on all platforms weekly
3. **Platform-Specific**: Test input/performance on actual devices
4. **Pre-Release**: Thorough testing on all targets before release

## Distribution Platforms

| Platform | Stores |
|----------|--------|
| DesktopGL | Steam, itch.io, GOG, Epic Games Store |
| WindowsDX | Microsoft Store, Steam, itch.io |
| Android | Google Play Store, Amazon Appstore |
| iOS | Apple App Store |

## Source

https://docs.monogame.net/articles/getting_started/index.html
