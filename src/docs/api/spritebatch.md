# SpriteBatch

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`SpriteBatch` is a class for efficiently drawing 2D sprites in MonoGame. It batches draw calls to optimize rendering performance. All sprite drawing must occur between `Begin()` and `End()` calls.

## Inheritance

`Object` → `SpriteBatch`

## Constructors

### SpriteBatch(GraphicsDevice graphicsDevice)

Creates a new SpriteBatch instance.

**Parameters:**
- `graphicsDevice` (GraphicsDevice): The graphics device used for rendering

## Methods

### Begin()

Begins a sprite batch operation using default settings (deferred sort mode, alpha blending).

**Overloads:**
- `Begin()`
- `Begin(SpriteSortMode sortMode, BlendState blendState)`
- `Begin(SpriteSortMode sortMode, BlendState blendState, SamplerState samplerState, DepthStencilState depthStencilState, RasterizerState rasterizerState, Effect effect, Matrix transformMatrix)`

**Parameters:**
- `sortMode`: Sprite drawing order (Deferred, Immediate, Texture, BackToFront, FrontToBack)
- `blendState`: Blending options (AlphaBlend, Additive, NonPremultiplied, Opaque)
- `samplerState`: Texture sampling options (PointClamp, LinearClamp, AnisotropicClamp)
- `transformMatrix`: Transformation matrix for camera/scaling effects

### Draw()

Adds a sprite to the batch. Must be called between `Begin()` and `End()`.

**Common Overloads:**
- `Draw(Texture2D texture, Vector2 position, Color color)`
- `Draw(Texture2D texture, Rectangle destinationRectangle, Color color)`
- `Draw(Texture2D texture, Vector2 position, Rectangle? sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)`

**Parameters:**
- `texture`: The texture to draw
- `position`: Position in screen coordinates
- `destinationRectangle`: Destination rectangle
- `sourceRectangle`: Source region from texture (null for entire texture)
- `color`: Tint color (use Color.White for no tint)
- `rotation`: Rotation in radians
- `origin`: Origin point for rotation/scaling
- `scale`: Uniform scale factor
- `effects`: Flipping effects (None, FlipHorizontally, FlipVertically)
- `layerDepth`: Depth for sorting (0.0 = front, 1.0 = back)

### End()

Flushes all batched sprites to the graphics device and ends the batch operation.

## Code Examples

### Basic Rendering

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);
    
    _spriteBatch.Begin();
    _spriteBatch.Draw(logoTexture, Vector2.Zero, Color.White);
    _spriteBatch.End();
    
    base.Draw(gameTime);
}
```

### Advanced Rendering with Transformations

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);

    _spriteBatch.Begin(
        sortMode: SpriteSortMode.BackToFront,
        blendState: BlendState.AlphaBlend,
        samplerState: SamplerState.PointClamp
    );

    // Draw background at layer 1.0 (back)
    _spriteBatch.Draw(_backgroundTexture, Vector2.Zero, null, Color.White,
        0f, Vector2.Zero, 1f, SpriteEffects.None, 1.0f);

    // Draw player with rotation at layer 0.5 (middle)
    _spriteBatch.Draw(_playerTexture, _playerPosition, null, Color.White,
        _playerRotation, _playerOrigin, 1.5f, SpriteEffects.None, 0.5f);

    // Draw enemy with tint at layer 0.0 (front)
    _spriteBatch.Draw(_enemyTexture, _enemyPosition, null, Color.Red * 0.8f,
        0f, Vector2.Zero, 1f, SpriteEffects.FlipHorizontally, 0.0f);

    _spriteBatch.End();
    base.Draw(gameTime);
}
```

## Related Classes

- [Texture2D](texture2d.md)
- [GraphicsDevice](graphicsdevice.md)
- [SpriteSortMode](spritesortmode.md)
- [BlendState](blendstate.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.SpriteBatch.html
