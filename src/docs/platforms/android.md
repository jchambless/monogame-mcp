# Android Platform

Deploy MonoGame games to Android phones and tablets.

## Overview

MonoGame supports Android 5.0 (API 21) and higher using .NET for Android (formerly Xamarin.Android).

## Requirements

- Visual Studio 2022 with Android workload
- .NET 8.0+ SDK
- Android SDK (API 21+)
- Java JDK 11+

## Creating an Android Project

```bash
dotnet new mgandroid -n MyGame
cd MyGame
dotnet build
```

## Project Structure

```
MyGame/
├── MyGame.Android.csproj
├── Activity1.cs
├── Game1.cs
├── Content/
│   └── Content.mgcb
├── Resources/
│   └── drawable/
├── Properties/
│   └── AndroidManifest.xml
└── Icon.png
```

## Activity1.cs

Main Android activity that hosts the game:

```csharp
[Activity(
    Label = "MyGame",
    MainLauncher = true,
    Icon = "@drawable/icon",
    AlwaysRetainTaskState = true,
    LaunchMode = LaunchMode.SingleInstance,
    ScreenOrientation = ScreenOrientation.SensorLandscape,
    ConfigurationChanges = ConfigChanges.Orientation | 
                          ConfigChanges.Keyboard | 
                          ConfigChanges.KeyboardHidden | 
                          ConfigChanges.ScreenSize)]
public class Activity1 : AndroidGameActivity
{
    private Game1 _game;

    protected override void OnCreate(Bundle bundle)
    {
        base.OnCreate(bundle);
        _game = new Game1();
        SetContentView((View)_game.Services.GetService(typeof(View)));
        _game.Run();
    }
}
```

## Android Manifest

`Properties/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" 
          package="com.yourcompany.mygame" 
          android:versionCode="1" 
          android:versionName="1.0">
  <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.VIBRATE" />
  <application 
      android:label="MyGame" 
      android:icon="@drawable/icon">
  </application>
</manifest>
```

## Input Support

### Touch Input

```csharp
TouchCollection touches = TouchPanel.GetState();
foreach (TouchLocation touch in touches)
{
    if (touch.State == TouchLocationState.Pressed)
    {
        Vector2 touchPosition = touch.Position;
        HandleTouch(touchPosition);
    }
}
```

### Accelerometer

```csharp
Vector3 acceleration = Accelerometer.GetState().Acceleration;
_playerPosition.X += acceleration.X * speed * deltaTime;
```

### Back Button

```csharp
protected override void Update(GameTime gameTime)
{
    if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed)
    {
        // Handle back button
        Exit();
    }
    base.Update(gameTime);
}
```

## Graphics

Set resolution and orientation in Initialize():
```csharp
_graphics.PreferredBackBufferWidth = 1920;
_graphics.PreferredBackBufferHeight = 1080;
_graphics.IsFullScreen = true;
_graphics.SupportedOrientations = DisplayOrientation.LandscapeLeft | DisplayOrientation.LandscapeRight;
_graphics.ApplyChanges();
```

Activity orientation: `[Activity(ScreenOrientation = ScreenOrientation.SensorLandscape)]`

## Content Pipeline

Build content for Android:

```
/platform:Android
/profile:Reach
```

**Texture Format**: Use `Etc1` or `Color`:

```
/processorParam:TextureFormat=Etc1
```

## Deployment

### Debug Build

```bash
dotnet build -c Debug
dotnet install --adb
```

### Release Build

```bash
dotnet publish -c Release
```

### APK Signing

1. Generate keystore:
```bash
keytool -genkey -v -keystore mygame.keystore -alias mygame 
        -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `.csproj`:
```xml
<PropertyGroup Condition=" '$(Configuration)' == 'Release' ">
  <AndroidKeyStore>true</AndroidKeyStore>
  <AndroidSigningKeyStore>mygame.keystore</AndroidSigningKeyStore>
  <AndroidSigningKeyAlias>mygame</AndroidSigningKeyAlias>
  <AndroidSigningKeyPass>your_password</AndroidSigningKeyPass>
  <AndroidSigningStorePass>your_password</AndroidSigningStorePass>
</PropertyGroup>
```

## Performance Optimization

### Texture Compression

Always use compressed textures on Android:
```
/processorParam:TextureFormat=Etc1
```

### Reduce Draw Calls

Use sprite batching extensively.

### Memory Management

```csharp
// Unload unused content
Content.Unload();

// Force garbage collection sparingly
GC.Collect();
```

### Frame Rate

```csharp
// Set target frame rate
TargetElapsedTime = TimeSpan.FromSeconds(1.0 / 60.0);
```

## Google Play Publishing

Create signed release APK/AAB, upload to Play Console, complete store listing, submit for review.

## Source

https://docs.monogame.net/articles/getting_started/1_setting_up_your_development_environment_macos.html
