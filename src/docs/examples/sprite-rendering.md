# Sprite Rendering

Complete patterns for 2D sprite rendering with SpriteBatch in MonoGame.

## Basic Sprite Drawing

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);
    
    _spriteBatch.Begin();
    _spriteBatch.Draw(_texture, new Vector2(100, 100), Color.White);
    _spriteBatch.End();
    
    base.Draw(gameTime);
}
```

## Rotated and Scaled Sprites

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);
    
    _spriteBatch.Begin();
    
    // Draw with rotation and scale
    _spriteBatch.Draw(
        _playerTexture,
        _position,                              // Position
        null,                                   // Source rectangle (null = entire texture)
        Color.White,                            // Tint color
        _rotation,                              // Rotation in radians
        new Vector2(_playerTexture.Width / 2,   // Origin (center of sprite)
                    _playerTexture.Height / 2),
        _scale,                                 // Scale
        SpriteEffects.None,                     // Flip effects
        0f                                      // Layer depth
    );
    
    _spriteBatch.End();
    base.Draw(gameTime);
}
```

## Layered Rendering with Depth Sorting

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);

    _spriteBatch.Begin(
        sortMode: SpriteSortMode.BackToFront,
        blendState: BlendState.AlphaBlend,
        samplerState: SamplerState.PointClamp
    );

    // Draw background at layer 1.0 (back)
    _spriteBatch.Draw(_backgroundTexture, Vector2.Zero, null, Color.White,
        0f, Vector2.Zero, 1f, SpriteEffects.None, 1.0f);

    // Draw player at layer 0.5 (middle)
    _spriteBatch.Draw(_playerTexture, _playerPosition, null, Color.White,
        _playerRotation, _playerOrigin, 1.5f, SpriteEffects.None, 0.5f);

    // Draw UI at layer 0.0 (front)
    _spriteBatch.Draw(_uiTexture, Vector2.Zero, null, Color.White,
        0f, Vector2.Zero, 1f, SpriteEffects.None, 0.0f);

    _spriteBatch.End();
    base.Draw(gameTime);
}
```

## Sprite Sheet Animation

```csharp
public class AnimatedSprite
{
    private Texture2D _spriteSheet;
    private int _frameWidth;
    private int _frameHeight;
    private int _currentFrame;
    private int _totalFrames;
    private float _timePerFrame;
    private float _timeElapsed;
    
    public AnimatedSprite(Texture2D spriteSheet, int frameWidth, int frameHeight, 
                          int totalFrames, float framesPerSecond)
    {
        _spriteSheet = spriteSheet;
        _frameWidth = frameWidth;
        _frameHeight = frameHeight;
        _totalFrames = totalFrames;
        _timePerFrame = 1f / framesPerSecond;
        _currentFrame = 0;
        _timeElapsed = 0;
    }
    
    public void Update(GameTime gameTime)
    {
        _timeElapsed += (float)gameTime.ElapsedGameTime.TotalSeconds;
        
        if (_timeElapsed >= _timePerFrame)
        {
            _currentFrame = (_currentFrame + 1) % _totalFrames;
            _timeElapsed = 0;
        }
    }
    
    public void Draw(SpriteBatch spriteBatch, Vector2 position)
    {
        int framesPerRow = _spriteSheet.Width / _frameWidth;
        int row = _currentFrame / framesPerRow;
        int column = _currentFrame % framesPerRow;
        
        Rectangle sourceRectangle = new Rectangle(
            column * _frameWidth,
            row * _frameHeight,
            _frameWidth,
            _frameHeight
        );
        
        spriteBatch.Draw(_spriteSheet, position, sourceRectangle, Color.White);
    }
}

// Usage:
AnimatedSprite playerSprite = new AnimatedSprite(spriteSheet, 64, 64, 8, 10f);

protected override void Update(GameTime gameTime)
{
    playerSprite.Update(gameTime);
    base.Update(gameTime);
}

protected override void Draw(GameTime gameTime)
{
    _spriteBatch.Begin();
    playerSprite.Draw(_spriteBatch, _position);
    _spriteBatch.End();
}
```

## Tiling Sprites

```csharp
protected override void Draw(GameTime gameTime)
{
    _spriteBatch.Begin();
    
    int tileSize = 64;
    int tilesX = GraphicsDevice.Viewport.Width / tileSize + 1;
    int tilesY = GraphicsDevice.Viewport.Height / tileSize + 1;
    
    for (int y = 0; y < tilesY; y++)
    {
        for (int x = 0; x < tilesX; x++)
        {
            _spriteBatch.Draw(
                _tileTexture,
                new Vector2(x * tileSize, y * tileSize),
                Color.White
            );
        }
    }
    
    _spriteBatch.End();
}
```

## Pixel-Perfect Rendering

```csharp
// For crisp pixel art without blurring
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);
    
    _spriteBatch.Begin(
        sortMode: SpriteSortMode.Deferred,
        blendState: BlendState.AlphaBlend,
        samplerState: SamplerState.PointClamp  // No texture filtering
    );
    
    _spriteBatch.Draw(_pixelArtTexture, _position, Color.White);
    
    _spriteBatch.End();
    base.Draw(gameTime);
}
```

## Source

Based on MonoGame documentation: https://docs.monogame.net/articles/getting_to_know/howto/graphics/
