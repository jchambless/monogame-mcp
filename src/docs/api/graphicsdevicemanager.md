# GraphicsDeviceManager

**Namespace:** Microsoft.Xna.Framework

## Summary

`GraphicsDeviceManager` initializes and controls the graphics device and presentation parameters.

## Constructors

### GraphicsDeviceManager(Game game)

Creates a new graphics device manager.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| PreferredBackBufferWidth | int | Desired window width |
| PreferredBackBufferHeight | int | Desired window height |
| IsFullScreen | bool | Fullscreen mode flag |
| SynchronizeWithVerticalRetrace | bool | V-Sync enabled |
| GraphicsDevice | GraphicsDevice | The graphics device |

## Methods

### ApplyChanges()

Applies changed settings to the graphics device.

## Code Example

```csharp
public Game1()
{
    _graphics = new GraphicsDeviceManager(this);
    _graphics.PreferredBackBufferWidth = 1280;
    _graphics.PreferredBackBufferHeight = 720;
    _graphics.IsFullScreen = false;
    _graphics.ApplyChanges();
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.GraphicsDeviceManager.html
