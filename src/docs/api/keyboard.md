# Keyboard

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`Keyboard` provides static methods for reading keyboard input state.

## Methods

### GetState()

Returns the current keyboard state with all key states.

**Returns:** KeyboardState

## Code Example

```csharp
KeyboardState keyState = Keyboard.GetState();

if (keyState.IsKeyDown(Keys.Space))
{
    Jump();
}
```

## Related Classes

- [KeyboardState](keyboardstate.md)
- [Keys](keys.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.Keyboard.html
