# Game

**Namespace:** Microsoft.Xna.Framework

## Summary

The `Game` class is the entry point for most MonoGame games. It handles setting up a window and graphics, runs the game loop, and provides virtual methods for initialization, content loading, updating game logic, and rendering.

## Inheritance

`Object` → `Game`

## Constructors

### Game()

Creates a new Game instance and initializes the game services container.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Content | ContentManager | Gets the content manager for loading game assets |
| GraphicsDevice | GraphicsDevice | Gets the graphics device for rendering |
| IsActive | bool | Indicates whether the game window is active |
| IsMouseVisible | bool | Gets or sets whether the mouse cursor is visible |
| Components | GameComponentCollection | Collection of game components managed by the game |
| Services | GameServiceContainer | Service provider for game services |
| Window | GameWindow | Gets the game window |

## Methods

### Initialize()

Called after construction to initialize the game. Set up any non-graphics logic and load non-graphics resources here. Call `base.Initialize()` at the end.

### LoadContent()

Called when graphics resources need to be loaded. Load textures, models, sounds, and other content here.

### Update(GameTime gameTime)

Called once per frame to update game logic. Handle input, physics, AI, and game state updates here.

**Parameters:**
- `gameTime` (GameTime): Snapshot of timing values

### Draw(GameTime gameTime)

Called once per frame to render the game. Draw sprites, models, and UI here.

**Parameters:**
- `gameTime` (GameTime): Snapshot of timing values

### UnloadContent()

Called when the game should release resources. Clean up content here.

### Exit()

Exits the game.

## Code Example

```csharp
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

public class Game1 : Game
{
    private GraphicsDeviceManager _graphics;
    private SpriteBatch _spriteBatch;
    private Texture2D _characterTexture;
    private Vector2 _position;
    private float _speed;

    public Game1()
    {
        _graphics = new GraphicsDeviceManager(this);
        Content.RootDirectory = "Content";
        IsMouseVisible = true;
    }

    protected override void Initialize()
    {
        _position = new Vector2(
            _graphics.PreferredBackBufferWidth / 2,
            _graphics.PreferredBackBufferHeight / 2
        );
        _speed = 100f;
        base.Initialize();
    }

    protected override void LoadContent()
    {
        _spriteBatch = new SpriteBatch(GraphicsDevice);
        _characterTexture = Content.Load<Texture2D>("Character");
    }

    protected override void Update(GameTime gameTime)
    {
        if (Keyboard.GetState().IsKeyDown(Keys.Escape))
            Exit();

        float deltaSpeed = _speed * (float)gameTime.ElapsedGameTime.TotalSeconds;
        KeyboardState keyState = Keyboard.GetState();
        if (keyState.IsKeyDown(Keys.Right)) _position.X += deltaSpeed;
        if (keyState.IsKeyDown(Keys.Left)) _position.X -= deltaSpeed;

        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.CornflowerBlue);

        _spriteBatch.Begin();
        _spriteBatch.Draw(_characterTexture, _position, Color.White);
        _spriteBatch.End();

        base.Draw(gameTime);
    }
}
```

## Related Classes

- [GameTime](gametime.md)
- [GraphicsDeviceManager](graphicsdevicemanager.md)
- [ContentManager](contentmanager.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Game.html
