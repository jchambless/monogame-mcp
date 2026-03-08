# GameTime

**Namespace:** Microsoft.Xna.Framework

## Summary

`GameTime` provides timing information for game loop updates and rendering, including total elapsed time and frame delta time.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| TotalGameTime | TimeSpan | Total time since game started |
| ElapsedGameTime | TimeSpan | Time since last Update/Draw call |
| IsRunningSlowly | bool | Indicates if game is running slower than target frame rate |

## Code Example

```csharp
protected override void Update(GameTime gameTime)
{
    float deltaTime = (float)gameTime.ElapsedGameTime.TotalSeconds;
    _position += _velocity * deltaTime; // Frame-rate independent movement
    base.Update(gameTime);
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.GameTime.html
