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
Vector3 accel = Accelerometer.GetState().Acceleration;
_tiltAngle = accel.X * MathHelper.PiOver4;
```

## Graphics

```csharp
// Resolution and orientation
_graphics.PreferredBackBufferWidth = 2048;
_graphics.PreferredBackBufferHeight = 1536;
_graphics.SupportedOrientations = DisplayOrientation.LandscapeLeft | 
                                 DisplayOrientation.LandscapeRight;
_graphics.IsFullScreen = true;
_graphics.ApplyChanges();
```

Safe area for notch:
```csharp
#if IOS
Rectangle safeArea = UIKit.UIApplication.SharedApplication.KeyWindow.SafeAreaInsets;
#endif
```

## Content Pipeline

```
/platform:iOS
/profile:Reach
/processorParam:TextureFormat=Pvrtc
```

## Deployment

Debug: Connect device via USB, trust computer, select device in Visual Studio, build and run.

App Store:
```bash
dotnet publish -c Release -f net8.0-ios
```
Upload via Xcode/Transporter, submit for review.

Provisioning: Development (test devices), Ad Hoc (specific devices), App Store (distribution).

## Performance

Use PVRTC compression, unload content between levels, target 60 FPS (or 30 for battery), batch sprites efficiently.

## Common Issues

App crashes: Check Xcode Console. Touch not responding: Enable TouchPanel gestures. Content not loading: Verify Build Action `BundleResource`. Memory warnings: Call Content.Unload().

App Store: Support latest iOS, all orientations, include required icon sizes and privacy policy.

## Source

https://docs.monogame.net/articles/getting_started/1_setting_up_your_development_environment_macos.html
