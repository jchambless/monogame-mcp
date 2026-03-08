# Effect

**Namespace:** Microsoft.Xna.Framework.Graphics

## Summary

`Effect` represents a compiled shader program. Use for custom rendering effects and shaders.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Parameters | EffectParameterCollection | Shader parameters |
| CurrentTechnique | EffectTechnique | Active rendering technique |

## Code Example

```csharp
private Effect _customShader;

protected override void LoadContent()
{
    _customShader = Content.Load<Effect>("Shaders/custom");
}

protected override void Draw(GameTime gameTime)
{
    _customShader.Parameters["Time"].SetValue((float)gameTime.TotalGameTime.TotalSeconds);
    _customShader.CurrentTechnique.Passes[0].Apply();
    
    _spriteBatch.Begin(effect: _customShader);
    _spriteBatch.Draw(texture, position, Color.White);
    _spriteBatch.End();
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Graphics.Effect.html
