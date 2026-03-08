# Camera System

2D camera implementation with position, zoom, and rotation for MonoGame.

## Basic 2D Camera

```csharp
public class Camera2D
{
    public Vector2 Position { get; set; }
    public float Zoom { get; set; }
    public float Rotation { get; set; }
    public Vector2 Origin { get; private set; }
    
    private readonly Viewport _viewport;
    
    public Camera2D(Viewport viewport)
    {
        _viewport = viewport;
        Zoom = 1.0f;
        Rotation = 0f;
        Position = Vector2.Zero;
        Origin = new Vector2(viewport.Width / 2f, viewport.Height / 2f);
    }
    
    public Matrix GetTransformMatrix()
    {
        return
            Matrix.CreateTranslation(new Vector3(-Position, 0)) *
            Matrix.CreateRotationZ(Rotation) *
            Matrix.CreateScale(Zoom, Zoom, 1) *
            Matrix.CreateTranslation(new Vector3(Origin, 0));
    }
    
    public Vector2 ScreenToWorld(Vector2 screenPosition)
    {
        return Vector2.Transform(screenPosition, Matrix.Invert(GetTransformMatrix()));
    }
    
    public Vector2 WorldToScreen(Vector2 worldPosition)
    {
        return Vector2.Transform(worldPosition, GetTransformMatrix());
    }
}
```

## Using Camera with SpriteBatch

```csharp
public class Game1 : Game
{
    private Camera2D _camera;
    private Vector2 _playerPosition;
    
    protected override void Initialize()
    {
        _camera = new Camera2D(GraphicsDevice.Viewport);
        _camera.Zoom = 1.0f;
        base.Initialize();
    }
    
    protected override void Update(GameTime gameTime)
    {
        // Camera follows player
        _camera.Position = _playerPosition;
        
        // Zoom with mouse wheel
        MouseState mouse = Mouse.GetState();
        int scrollDelta = mouse.ScrollWheelValue - _previousMouseState.ScrollWheelValue;
        if (scrollDelta != 0)
        {
            _camera.Zoom += scrollDelta * 0.001f;
            _camera.Zoom = MathHelper.Clamp(_camera.Zoom, 0.5f, 3.0f);
        }
        
        base.Update(gameTime);
    }
    
    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.CornflowerBlue);
        
        // Draw world with camera transform
        _spriteBatch.Begin(transformMatrix: _camera.GetTransformMatrix());
        _spriteBatch.Draw(_worldTexture, Vector2.Zero, Color.White);
        _spriteBatch.Draw(_playerTexture, _playerPosition, Color.White);
        _spriteBatch.End();
        
        // Draw UI without camera transform
        _spriteBatch.Begin();
        _spriteBatch.DrawString(_font, "Score: 1000", new Vector2(10, 10), Color.White);
        _spriteBatch.End();
        
        base.Draw(gameTime);
    }
}
```

## Camera with Smooth Following

```csharp
public class SmoothCamera : Camera2D
{
    private Vector2 _targetPosition;
    private float _followSpeed = 5f;
    
    public SmoothCamera(Viewport viewport) : base(viewport)
    {
    }
    
    public void Follow(Vector2 targetPosition, GameTime gameTime)
    {
        _targetPosition = targetPosition;
        
        float deltaTime = (float)gameTime.ElapsedGameTime.TotalSeconds;
        Position = Vector2.Lerp(Position, _targetPosition, _followSpeed * deltaTime);
    }
}

// Usage:
protected override void Update(GameTime gameTime)
{
    _camera.Follow(_playerPosition, gameTime);
    base.Update(gameTime);
}
```

## Camera with Bounds

```csharp
public class BoundedCamera : Camera2D
{
    private Rectangle _bounds;
    
    public BoundedCamera(Viewport viewport, Rectangle bounds) : base(viewport)
    {
        _bounds = bounds;
    }
    
    public void UpdatePosition(Vector2 newPosition)
    {
        Position = newPosition;
        ClampToBounds();
    }
    
    private void ClampToBounds()
    {
        // Calculate visible area
        Vector2 cameraWorldMin = ScreenToWorld(Vector2.Zero);
        Vector2 cameraWorldMax = ScreenToWorld(new Vector2(_viewport.Width, _viewport.Height));
        
        Vector2 visibleArea = cameraWorldMax - cameraWorldMin;
        
        // Clamp to bounds
        Position = new Vector2(
            MathHelper.Clamp(Position.X, _bounds.Left + visibleArea.X / 2, 
                            _bounds.Right - visibleArea.X / 2),
            MathHelper.Clamp(Position.Y, _bounds.Top + visibleArea.Y / 2, 
                            _bounds.Bottom - visibleArea.Y / 2)
        );
    }
}
```

## Mouse Position in World Space

```csharp
protected override void Update(GameTime gameTime)
{
    MouseState mouse = Mouse.GetState();
    
    // Convert mouse position from screen to world coordinates
    Vector2 mouseWorldPos = _camera.ScreenToWorld(new Vector2(mouse.X, mouse.Y));
    
    if (mouse.LeftButton == ButtonState.Pressed)
    {
        // Spawn object at mouse world position
        SpawnObject(mouseWorldPos);
    }
    
    base.Update(gameTime);
}
```

## Source

Based on MonoGame documentation: https://docs.monogame.net/articles/getting_to_know/whatis/graphics/WhatIs_Camera.html
