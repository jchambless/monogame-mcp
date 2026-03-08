# SpriteFont

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`SpriteFont` represents a loaded font for rendering text. Fonts must be processed through the Content Pipeline.

## Methods

### MeasureString(string text)

Calculates the size of rendered text.

**Returns:** Vector2 with width and height

## Code Example

```csharp
private SpriteFont _font;

protected override void LoadContent()
{
    _font = Content.Load<SpriteFont>("Fonts/Arial");
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);
    
    _spriteBatch.Begin();
    string message = "Score: 1000";
    Vector2 textSize = _font.MeasureString(message);
    Vector2 position = new Vector2(10, 10);
    _spriteBatch.DrawString(_font, message, position, Color.White);
    _spriteBatch.End();
    
    base.Draw(gameTime);
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.SpriteFont.html
