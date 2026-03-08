# Mouse

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`Mouse` provides static methods for reading mouse input state and setting cursor properties.

## Methods

### GetState()

Returns the current mouse state with button states and position.

**Returns:** MouseState

### SetPosition(int x, int y)

Sets the mouse cursor position in window coordinates.

## Code Example

```csharp
MouseState mouseState = Mouse.GetState();

if (mouseState.LeftButton == ButtonState.Pressed)
{
    Vector2 clickPosition = new Vector2(mouseState.X, mouseState.Y);
    HandleClick(clickPosition);
}
```

## Related Classes

- [MouseState](mousestate.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.Mouse.html
