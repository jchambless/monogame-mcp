# KeyboardState

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`KeyboardState` represents a snapshot of all keyboard key states at a specific moment. Use for detecting key presses, releases, and holds.

## Methods

### IsKeyDown(Keys key)

Returns true if the specified key is pressed.

### IsKeyUp(Keys key)

Returns true if the specified key is released.

### GetPressedKeys()

Returns an array of all currently pressed keys.

## Code Examples

### Detecting Key Press (Just Pressed)

```csharp
private KeyboardState _previousKeyState;

protected override void Update(GameTime gameTime)
{
    KeyboardState keyState = Keyboard.GetState();
    
    // Detect single key press (not held)
    if (keyState.IsKeyDown(Keys.Space) && _previousKeyState.IsKeyUp(Keys.Space))
    {
        FireWeapon();
    }
    
    _previousKeyState = keyState;
    base.Update(gameTime);
}
```

### Continuous Movement

```csharp
KeyboardState keyState = Keyboard.GetState();
float deltaTime = (float)gameTime.ElapsedGameTime.TotalSeconds;

if (keyState.IsKeyDown(Keys.W)) _position.Y -= 200 * deltaTime;
if (keyState.IsKeyDown(Keys.S)) _position.Y += 200 * deltaTime;
if (keyState.IsKeyDown(Keys.A)) _position.X -= 200 * deltaTime;
if (keyState.IsKeyDown(Keys.D)) _position.X += 200 * deltaTime;
```

## Related Classes

- [Keyboard](keyboard.md)
- [Keys](keys.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.KeyboardState.html
