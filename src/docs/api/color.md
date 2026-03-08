# Color

**Namespace:** Microsoft.Xna.Framework

## Summary

`Color` represents a 32-bit packed RGBA color value. Provides predefined colors and methods for color manipulation.

## Inheritance

`ValueType` → `Color`

## Constructors

### Color(int r, int g, int b)

Creates a color from RGB components (0-255).

### Color(int r, int g, int b, int a)

Creates a color from RGBA components (0-255).

### Color(float r, float g, float b)

Creates a color from RGB floats (0.0-1.0).

## Properties

| Property | Type | Description |
|----------|------|-------------|
| R | byte | Red component (0-255) |
| G | byte | Green component (0-255) |
| B | byte | Blue component (0-255) |
| A | byte | Alpha component (0-255) |

## Predefined Colors

White, Black, Red, Green, Blue, Yellow, Orange, Purple, Pink, Gray, CornflowerBlue, TransparentBlack, TransparentWhite, and many more.

## Operators

- `*` Multiply color components (tinting/fading)

## Code Examples

```csharp
// Use predefined colors
GraphicsDevice.Clear(Color.CornflowerBlue);
_spriteBatch.Draw(texture, position, Color.White);

// Create custom colors
Color customColor = new Color(255, 128, 0); // Orange
Color semiTransparent = new Color(255, 255, 255, 128);

// Color multiplication for fading
Color fadedRed = Color.Red * 0.5f;

// Tint sprites
_spriteBatch.Draw(enemyTexture, position, Color.Red * 0.8f);
```

## Related Classes

- [SpriteBatch](spritebatch.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Color.html
