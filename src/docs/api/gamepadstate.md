# GamePadState

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`GamePadState` represents a snapshot of all gamepad input at a specific moment.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Buttons | GamePadButtons | Button states (A, B, X, Y, etc.) |
| ThumbSticks | GamePadThumbSticks | Analog stick positions |
| Triggers | GamePadTriggers | Trigger values (Left, Right) |
| DPad | GamePadDPad | D-Pad directional states |
| IsConnected | bool | Whether the gamepad is connected |

## Methods

### IsButtonDown(Buttons button)

Returns true if the specified button is pressed.

### IsButtonUp(Buttons button)

Returns true if the specified button is released.

## Code Example

```csharp
private GamePadState _oldPadState;

protected override void Update(GameTime gameTime)
{
    GamePadState padState = GamePad.GetState(PlayerIndex.One);
    
    // Detect button press
    if (padState.IsButtonDown(Buttons.A) && !_oldPadState.IsButtonDown(Buttons.A))
    {
        Jump();
    }
    
    // Analog movement
    Vector2 thumbStickMovement = new Vector2(
        padState.ThumbSticks.Left.X,
        -padState.ThumbSticks.Left.Y
    );
    _position += thumbStickMovement * speed * deltaTime;
    
    // Trigger input
    float leftTrigger = padState.Triggers.Left;
    
    _oldPadState = padState;
    base.Update(gameTime);
}
```

## Related Classes

- [GamePad](gamepad.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.GamePadState.html
