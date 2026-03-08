# BlendState

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`BlendState` controls how colors blend when rendering over existing pixels.

## Predefined States

| State | Description |
|-------|-------------|
| AlphaBlend | Standard alpha blending |
| Additive | Additive blending (colors add together) |
| NonPremultiplied | Non-premultiplied alpha blending |
| Opaque | No blending (replaces existing pixels) |

## Code Example

```csharp
_spriteBatch.Begin(blendState: BlendState.Additive);
_spriteBatch.Draw(glowTexture, position, Color.White);
_spriteBatch.End();
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.BlendState.html
