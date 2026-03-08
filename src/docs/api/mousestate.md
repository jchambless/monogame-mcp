# MouseState

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`MouseState` represents a snapshot of mouse button states and cursor position.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| X | int | Mouse X position in window coordinates |
| Y | int | Mouse Y position in window coordinates |
| Position | Point | Mouse position as Point |
| LeftButton | ButtonState | Left button state |
| RightButton | ButtonState | Right button state |
| MiddleButton | ButtonState | Middle button state |
| ScrollWheelValue | int | Scroll wheel value |

## Code Examples

### Mouse Button Detection

```csharp
private MouseState _previousMouseState;

protected override void Update(GameTime gameTime)
{
    MouseState mouseState = Mouse.GetState();
    
    if (mouseState.LeftButton == ButtonState.Pressed &&
        _previousMouseState.LeftButton == ButtonState.Released)
    {
        Vector2 clickPos = new Vector2(mouseState.X, mouseState.Y);
        HandleClick(clickPos);
    }
    
    _previousMouseState = mouseState;
    base.Update(gameTime);
}
```

### Mouse Wheel Zoom

```csharp
int scrollDelta = mouseState.ScrollWheelValue - _previousMouseState.ScrollWheelValue;
if (scrollDelta != 0)
{
    _zoom += scrollDelta * 0.001f;
    _zoom = MathHelper.Clamp(_zoom, 0.5f, 3.0f);
}
```

## Related Classes

- [Mouse](mouse.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.MouseState.html
