# Texture2D

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`Texture2D` represents a 2D texture image that can be rendered to the screen or used as a render target. Textures are typically loaded through the Content Pipeline or created programmatically.

## Inheritance

`Object` → `Texture` → `Texture2D`

## Constructors

### Texture2D(GraphicsDevice graphicsDevice, int width, int height)

Creates an empty Texture2D with specified dimensions.

**Parameters:**
- `graphicsDevice`: The graphics device
- `width`: Width in pixels
- `height`: Height in pixels

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Width | int | Texture width in pixels |
| Height | int | Texture height in pixels |
| Bounds | Rectangle | Rectangle representing texture bounds |
| Format | SurfaceFormat | Pixel format of the texture |

## Methods

### FromStream(GraphicsDevice graphicsDevice, Stream stream)

Loads a Texture2D from an image file stream (PNG, JPG, BMP).

**Parameters:**
- `graphicsDevice`: The graphics device
- `stream`: Stream containing image data

**Returns:** Texture2D

### GetData<T>(T[] data)

Copies texture data to an array.

**Parameters:**
- `data`: Array to receive pixel data

### SetData<T>(T[] data)

Sets texture data from an array.

**Parameters:**
- `data`: Array containing pixel data

## Code Examples

### Loading Texture via Content Pipeline

```csharp
protected override void LoadContent()
{
    _spriteBatch = new SpriteBatch(GraphicsDevice);
    ballTexture = Content.Load<Texture2D>("ball");
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);
    _spriteBatch.Begin();
    _spriteBatch.Draw(ballTexture, new Vector2(0, 0), Color.White);
    _spriteBatch.End();
    base.Draw(gameTime);
}
```

### Creating Texture at Runtime

```csharp
public static Texture2D CreateTexture(GraphicsDevice device, int width, int height)
{
    Texture2D texture = new Texture2D(device, width, height);
    Color[] data = new Color[width * height];
    for (int pixel = 0; pixel < data.Length; pixel++)
    {
        data[pixel] = Color.White;
    }
    texture.SetData(data);
    return texture;
}
```

## Related Classes

- [SpriteBatch](spritebatch.md)
- [ContentManager](contentmanager.md)
- [GraphicsDevice](graphicsdevice.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.Texture2D.html
