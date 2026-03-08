# GraphicsDevice

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`GraphicsDevice` is the core graphics rendering interface. It manages the rendering pipeline, handles display output, and provides methods for clearing the screen, setting render targets, and managing graphics state.

## Inheritance

`Object` → `GraphicsDevice`

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Viewport | Viewport | Gets or sets the viewport for rendering |
| PresentationParameters | PresentationParameters | Display and backbuffer settings |
| BlendState | BlendState | Current blend state for transparency |
| DepthStencilState | DepthStencilState | Current depth/stencil state |
| RasterizerState | RasterizerState | Current rasterizer state |
| SamplerStates | SamplerStateCollection | Texture sampling states |

## Methods

### Clear(Color color)

Clears the backbuffer to a solid color.

**Parameters:**
- `color`: The clear color

### SetRenderTarget(RenderTarget2D renderTarget)

Sets the active render target. Pass null to render to the backbuffer.

**Parameters:**
- `renderTarget`: The render target, or null for backbuffer

### Present()

Presents the backbuffer to the display (called automatically by Game.Draw).

## Code Examples

### Basic Clear and Viewport

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);
    
    // Your drawing code here
    
    base.Draw(gameTime);
}
```

### Split-Screen Viewports

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Viewport = defaultViewport;
    GraphicsDevice.Clear(Color.Black);

    GraphicsDevice.Viewport = leftViewport;
    DrawScene(gameTime, Camera1.ViewMatrix, projectionMatrix);

    GraphicsDevice.Viewport = rightViewport;
    DrawScene(gameTime, Camera2.ViewMatrix, projectionMatrix);

    base.Draw(gameTime);
}
```

### Render Target Usage

```csharp
private void DrawToRenderTarget()
{
    GraphicsDevice.SetRenderTarget(renderTarget);
    GraphicsDevice.Clear(Color.Black);
    
    _spriteBatch.Begin();
    _spriteBatch.Draw(sourceTexture, Vector2.Zero, Color.White);
    _spriteBatch.End();
    
    GraphicsDevice.SetRenderTarget(null);
}
```

## Related Classes

- [GraphicsDeviceManager](graphicsdevicemanager.md)
- [RenderTarget2D](rendertarget2d.md)
- [Viewport](viewport.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.GraphicsDevice.html
