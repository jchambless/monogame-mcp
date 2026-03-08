# RenderTarget2D

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`RenderTarget2D` is a 2D texture that can be rendered to. Used for post-processing, mini-maps, and texture generation.

## Constructors

### RenderTarget2D(GraphicsDevice graphicsDevice, int width, int height)

Creates a new render target with specified dimensions.

## Code Example

```csharp
private RenderTarget2D renderTarget;

protected override void LoadContent()
{
    renderTarget = new RenderTarget2D(GraphicsDevice, 800, 600);
}

private void RenderToTexture()
{
    GraphicsDevice.SetRenderTarget(renderTarget);
    GraphicsDevice.Clear(Color.Black);
    
    _spriteBatch.Begin();
    _spriteBatch.Draw(sourceTexture, Vector2.Zero, Color.White);
    _spriteBatch.End();
    
    GraphicsDevice.SetRenderTarget(null);
}

protected override void Draw(GameTime gameTime)
{
    RenderToTexture();
    
    GraphicsDevice.Clear(Color.CornflowerBlue);
    _spriteBatch.Begin();
    _spriteBatch.Draw(renderTarget, new Vector2(100, 100), Color.White);
    _spriteBatch.End();
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.RenderTarget2D.html
