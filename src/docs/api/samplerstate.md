# SamplerState

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`SamplerState` controls texture sampling and filtering behavior.

## Predefined States

| State | Description |
|-------|-------------|
| PointClamp | Nearest-neighbor sampling, no wrapping (pixel art) |
| LinearClamp | Linear filtering, no wrapping |
| AnisotropicClamp | Anisotropic filtering, no wrapping |
| PointWrap | Nearest-neighbor with texture wrapping |
| LinearWrap | Linear filtering with wrapping |

## Code Example

```csharp
// For pixel art (no blurring)
_spriteBatch.Begin(samplerState: SamplerState.PointClamp);
_spriteBatch.Draw(pixelArtTexture, position, Color.White);
_spriteBatch.End();
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.SamplerState.html
