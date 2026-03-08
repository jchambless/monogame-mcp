# Input Handling

Complete patterns for handling keyboard, mouse, and gamepad input in MonoGame.

## Keyboard Input

### Detecting Key Press (Just Pressed vs. Held)

```csharp
private KeyboardState _previousKeyState;

protected override void Update(GameTime gameTime)
{
    KeyboardState keyState = Keyboard.GetState();
    
    // Detect single key press (just pressed, not held)
    if (keyState.IsKeyDown(Keys.Space) && _previousKeyState.IsKeyUp(Keys.Space))
    {
        FireWeapon();
    }
    
    // Continuous movement (while held)
    float deltaTime = (float)gameTime.ElapsedGameTime.TotalSeconds;
    if (keyState.IsKeyDown(Keys.W)) _position.Y -= 200 * deltaTime;
    if (keyState.IsKeyDown(Keys.S)) _position.Y += 200 * deltaTime;
    if (keyState.IsKeyDown(Keys.A)) _position.X -= 200 * deltaTime;
    if (keyState.IsKeyDown(Keys.D)) _position.X += 200 * deltaTime;
    
    _previousKeyState = keyState;
    base.Update(gameTime);
}
```

## Mouse Input

### Mouse Button Detection and Position

```csharp
private MouseState _previousMouseState;

protected override void Update(GameTime gameTime)
{
    MouseState mouseState = Mouse.GetState();
    
    // Detect left click (just clicked)
    if (mouseState.LeftButton == ButtonState.Pressed &&
        _previousMouseState.LeftButton == ButtonState.Released)
    {
        Vector2 clickPosition = new Vector2(mouseState.X, mouseState.Y);
        HandleClick(clickPosition);
    }
    
    // Mouse wheel zoom
    int scrollDelta = mouseState.ScrollWheelValue - _previousMouseState.ScrollWheelValue;
    if (scrollDelta != 0)
    {
        _zoom += scrollDelta * 0.001f;
        _zoom = MathHelper.Clamp(_zoom, 0.5f, 3.0f);
    }
    
    // Transform mouse position to world space (with camera)
    Vector2 mouseWorldPos = Vector2.Transform(
        new Vector2(mouseState.X, mouseState.Y),
        Matrix.Invert(GetCameraTransform())
    );
    
    _previousMouseState = mouseState;
    base.Update(gameTime);
}
```

## GamePad Input

### Analog Sticks and Button Detection

```csharp
private GamePadState _previousPadState;

protected override void Update(GameTime gameTime)
{
    GamePadState padState = GamePad.GetState(PlayerIndex.One);
    
    if (!padState.IsConnected)
        return;
    
    float deltaTime = (float)gameTime.ElapsedGameTime.TotalSeconds;
    
    // Analog stick movement (with deadzone)
    Vector2 thumbStick = padState.ThumbSticks.Left;
    if (thumbStick.LengthSquared() > 0.1f) // Deadzone
    {
        _position.X += thumbStick.X * 200 * deltaTime;
        _position.Y -= thumbStick.Y * 200 * deltaTime; // Y is inverted
    }
    
    // Detect button press
    if (padState.IsButtonDown(Buttons.A) && _previousPadState.IsButtonUp(Buttons.A))
    {
        Jump();
        GamePad.SetVibration(PlayerIndex.One, 0.5f, 0.5f);
    }
    else if (padState.IsButtonUp(Buttons.A))
    {
        GamePad.SetVibration(PlayerIndex.One, 0f, 0f);
    }
    
    // Trigger input
    float rightTrigger = padState.Triggers.Right;
    if (rightTrigger > 0.1f)
    {
        Accelerate(rightTrigger);
    }
    
    _previousPadState = padState;
    base.Update(gameTime);
}
```

## Combined Input System

```csharp
public class InputManager
{
    private KeyboardState _prevKeyState;
    private MouseState _prevMouseState;
    private GamePadState _prevPadState;
    
    public void Update()
    {
        _prevKeyState = Keyboard.GetState();
        _prevMouseState = Mouse.GetState();
        _prevPadState = GamePad.GetState(PlayerIndex.One);
    }
    
    public bool IsActionPressed()
    {
        var keyState = Keyboard.GetState();
        var padState = GamePad.GetState(PlayerIndex.One);
        
        return (keyState.IsKeyDown(Keys.Space) && _prevKeyState.IsKeyUp(Keys.Space)) ||
               (padState.IsButtonDown(Buttons.A) && _prevPadState.IsButtonUp(Buttons.A));
    }
    
    public Vector2 GetMovementInput()
    {
        Vector2 movement = Vector2.Zero;
        
        var keyState = Keyboard.GetState();
        if (keyState.IsKeyDown(Keys.W)) movement.Y -= 1;
        if (keyState.IsKeyDown(Keys.S)) movement.Y += 1;
        if (keyState.IsKeyDown(Keys.A)) movement.X -= 1;
        if (keyState.IsKeyDown(Keys.D)) movement.X += 1;
        
        if (movement != Vector2.Zero)
            movement.Normalize();
        
        // Gamepad overrides keyboard
        var padState = GamePad.GetState(PlayerIndex.One);
        if (padState.IsConnected && padState.ThumbSticks.Left.LengthSquared() > 0.1f)
        {
            movement.X = padState.ThumbSticks.Left.X;
            movement.Y = -padState.ThumbSticks.Left.Y;
        }
        
        return movement;
    }
}
```

## Source

Based on MonoGame documentation: https://docs.monogame.net/articles/getting_to_know/howto/input/
