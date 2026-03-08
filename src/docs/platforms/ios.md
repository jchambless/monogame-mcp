# iOS Platform

Deploy MonoGame games to iPhone and iPad.

## Overview

MonoGame supports iOS 10.0+ using .NET for iOS (formerly Xamarin.iOS).

## Requirements

- macOS with Xcode 14+
- Visual Studio 2022 for Mac or VS Code
- .NET 8.0+ SDK
- Apple Developer account ($99/year for App Store)

## Creating an iOS Project

```bash
dotnet new mgios -n MyGame
cd MyGame
dotnet build
```

## Project Structure

```
MyGame/
├── MyGame.iOS.csproj
├── AppDelegate.cs
├── ViewController.cs
├── Game1.cs
├── Content/
│   └── Content.mgcb
├── Resources/
│   └── Icon.png
├── Info.plist
└── Entitlements.plist
```

## ViewController.cs

```csharp
[Register("ViewController")]
public class ViewController : UIViewController
{
    private Game1 _game;

    public override void ViewDidLoad()
    {
        base.ViewDidLoad();
        _game = new Game1();
        _game.Run();
    }
}
```

## Info.plist Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dict>
    <key>CFBundleDisplayName</key>
    <string>MyGame</string>
    <key>CFBundleIdentifier</key>
    <string>com.yourcompany.mygame</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
        <string>opengles-2</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIStatusBarHidden</key>
    <true/>
</dict>
```

## Input Support

### Touch Input

```csharp
TouchCollection touches = TouchPanel.GetState();
foreach (TouchLocation touch in touches)
{
    if (touch.State == TouchLocationState.Pressed)
    {
        Vector2 position = touch.Position;
        HandleTouch(position);
    }
}
```

### Gestures

```csharp
protected override void Initialize()
{
    TouchPanel.EnabledGestures = GestureType.Tap | 
                                 GestureType.FreeDrag |
                                 GestureType.Pinch;
    base.Initialize();
}

protected override void Update(GameTime gameTime)
{
    while (TouchPanel.IsGestureAvailable)
    {
        GestureSample gesture = TouchPanel.ReadGesture();
        
        switch (gesture.GestureType)
        {
            case GestureType.Tap:
                HandleTap(gesture.Position);
                break;
            case GestureType.Pinch:
                HandlePinch(gesture.Delta);
                break;
        }
    }
}
```

### Accelerometer

```csharp
Vector3 acceleration = Accelerometer.GetState().Acceleration;
_tiltAngle = acceleration.X * MathHelper.PiOver4;
```

## Graphics

### Resolution and Orientation

```csharp
protected override void Initialize()
{
    // Native resolution (Retina)
    _graphics.PreferredBackBufferWidth = 2048;
    _graphics.PreferredBackBufferHeight = 1536;
    
    // Landscape
    _graphics.SupportedOrientations = DisplayOrientation.LandscapeLeft | 
                                     DisplayOrientation.LandscapeRight;
    
    _graphics.IsFullScreen = true;
    _graphics.ApplyChanges();
    
    base.Initialize();
}
```

### Safe Area (iPhone X+ Notch)

```csharp
#if IOS
Rectangle safeArea = UIKit.UIApplication.SharedApplication.KeyWindow.SafeAreaInsets;
// Adjust UI positioning to avoid notch
#endif
```

## Content Pipeline

Build content for iOS:

```
/platform:iOS
/profile:Reach
```

**Texture Format**: Use `Pvrtc` or `Color`:

```
/processorParam:TextureFormat=Pvrtc
```

## Deployment

### Debug on Device

1. Connect iPhone/iPad via USB
2. Trust computer on device
3. In Visual Studio, select device as target
4. Build and run

### App Store Deployment

1. Archive build:
```bash
dotnet publish -c Release -f net8.0-ios
```

2. Create App Store Connect listing
3. Upload via Xcode or Transporter
4. Submit for review

### Provisioning Profiles

Required for device testing and distribution:

1. Development: Test on your devices
2. Ad Hoc: Test on specific devices
3. App Store: Distribute via App Store

## Performance Optimization

### Texture Compression

Use PVRTC for best iOS performance:
```
/processorParam:TextureFormat=PvrtcRgb4Bpp
```

### Memory Management

iOS has strict memory limits:

```csharp
// Unload content between levels
Content.Unload();

// Monitor memory in Update
if (GC.GetTotalMemory(false) > 100_000_000) // 100 MB
{
    Content.Unload();
    GC.Collect();
}
```

### Frame Rate

```csharp
// Target 60 FPS
TargetElapsedTime = TimeSpan.FromSeconds(1.0 / 60.0);

// Or 30 FPS for better battery
TargetElapsedTime = TimeSpan.FromSeconds(1.0 / 30.0);
```

### Reduce Draw Calls

Batch sprites efficiently on iOS due to GPU limitations.

## Common Issues

App crashes: Check Xcode Console. Touch not responding: Enable TouchPanel.EnabledGestures. Content not loading: Verify Build Action `BundleResource`. Memory warnings: Call Content.Unload() and GC.Collect().

## App Store

Support latest iOS, all device orientations, required app icon sizes, and include privacy policy.

## Source

https://docs.monogame.net/articles/getting_started/1_setting_up_your_development_environment_macos.html
