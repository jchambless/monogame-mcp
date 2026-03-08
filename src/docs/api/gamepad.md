# GamePad

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`GamePad` provides static methods for reading gamepad/controller input state.

## Methods

### GetState(PlayerIndex playerIndex)

Returns the current gamepad state for the specified player.

**Parameters:**
- `playerIndex`: Player index (One, Two, Three, Four)

**Returns:** GamePadState

### SetVibration(PlayerIndex playerIndex, float leftMotor, float rightMotor)

Sets controller vibration intensity (0.0 to 1.0).

## Code Example

```csharp
GamePadState gamepadState = GamePad.GetState(PlayerIndex.One);

if (gamepadState.Buttons.A == ButtonState.Pressed)
{
    Jump();
    GamePad.SetVibration(PlayerIndex.One, 0.5f, 0.5f);
}

Vector2 movement = gamepadState.ThumbSticks.Left;
_position += movement * speed * deltaTime;
```

## Related Classes

- [GamePadState](gamepadstate.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.GamePad.html
