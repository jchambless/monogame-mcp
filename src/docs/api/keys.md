# Keys

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`Keys` enumeration contains all keyboard key codes.

## Common Values

Space, Enter, Escape, Tab, Back (Backspace), A-Z, D0-D9 (number keys), Up, Down, Left, Right, F1-F12, LeftShift, RightShift, LeftControl, RightControl, LeftAlt, RightAlt

## Code Example

```csharp
KeyboardState keyState = Keyboard.GetState();

if (keyState.IsKeyDown(Keys.W)) MoveUp();
if (keyState.IsKeyDown(Keys.S)) MoveDown();
if (keyState.IsKeyDown(Keys.A)) MoveLeft();
if (keyState.IsKeyDown(Keys.D)) MoveRight();
if (keyState.IsKeyDown(Keys.Space)) Jump();
if (keyState.IsKeyDown(Keys.Escape)) Exit();
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.Keys.html
