# Buttons

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`Buttons` enumeration contains all gamepad button and control codes.

## Common Values

A, B, X, Y, LeftShoulder, RightShoulder, LeftTrigger, RightTrigger, LeftStick, RightStick, Start, Back, DPadUp, DPadDown, DPadLeft, DPadRight

## Code Example

```csharp
GamePadState padState = GamePad.GetState(PlayerIndex.One);

if (padState.IsButtonDown(Buttons.A)) Jump();
if (padState.IsButtonDown(Buttons.B)) Attack();
if (padState.IsButtonDown(Buttons.Start)) Pause();
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.Buttons.html
