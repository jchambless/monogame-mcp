# BasicEffect

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`BasicEffect` is a built-in effect for basic 3D rendering with lighting, texturing, and fog support.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| World | Matrix | World transformation matrix |
| View | Matrix | View (camera) matrix |
| Projection | Matrix | Projection matrix |
| TextureEnabled | bool | Enable texture mapping |
| Texture | Texture2D | The texture to apply |
| VertexColorEnabled | bool | Use vertex colors |
| LightingEnabled | bool | Enable lighting |

## Code Example

```csharp
BasicEffect effect = new BasicEffect(GraphicsDevice);
effect.World = Matrix.Identity;
effect.View = Matrix.CreateLookAt(cameraPosition, Vector3.Zero, Vector3.Up);
effect.Projection = Matrix.CreatePerspectiveFieldOfView(
    MathHelper.ToRadians(45), aspectRatio, 0.1f, 1000f);
effect.TextureEnabled = true;
effect.Texture = texture;
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.BasicEffect.html
