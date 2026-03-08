# Game State Management

Scene/screen manager pattern for handling menu screens, gameplay, and transitions.

## Basic Game State Manager

```csharp
public abstract class GameState
{
    protected Game Game { get; private set; }
    protected SpriteBatch SpriteBatch { get; private set; }
    protected ContentManager Content { get; private set; }
    
    public GameState(Game game, SpriteBatch spriteBatch)
    {
        Game = game;
        SpriteBatch = spriteBatch;
        Content = new ContentManager(game.Services, "Content");
    }
    
    public virtual void Initialize() { }
    public virtual void LoadContent() { }
    public virtual void UnloadContent() { Content.Unload(); }
    public abstract void Update(GameTime gameTime);
    public abstract void Draw(GameTime gameTime);
}

public class GameStateManager
{
    private Stack<GameState> _states;
    private GameState _currentState;
    
    public GameStateManager()
    {
        _states = new Stack<GameState>();
    }
    
    public void PushState(GameState state)
    {
        _states.Push(state);
        _currentState = state;
        _currentState.Initialize();
        _currentState.LoadContent();
    }
    
    public void PopState()
    {
        if (_states.Count > 0)
        {
            _currentState.UnloadContent();
            _states.Pop();
            _currentState = _states.Count > 0 ? _states.Peek() : null;
        }
    }
    
    public void ChangeState(GameState newState)
    {
        if (_states.Count > 0)
        {
            PopState();
        }
        PushState(newState);
    }
    
    public void Update(GameTime gameTime)
    {
        _currentState?.Update(gameTime);
    }
    
    public void Draw(GameTime gameTime)
    {
        _currentState?.Draw(gameTime);
    }
}
```

## Menu State Example

```csharp
public class MenuState : GameState
{
    private SpriteFont _font;
    private List<string> _menuItems;
    private int _selectedIndex;
    private KeyboardState _previousKeyState;
    
    public MenuState(Game game, SpriteBatch spriteBatch) : base(game, spriteBatch)
    {
        _menuItems = new List<string> { "New Game", "Load Game", "Options", "Exit" };
        _selectedIndex = 0;
    }
    
    public override void LoadContent()
    {
        _font = Content.Load<SpriteFont>("Fonts/MenuFont");
    }
    
    public override void Update(GameTime gameTime)
    {
        KeyboardState keyState = Keyboard.GetState();
        
        // Navigate menu
        if (keyState.IsKeyDown(Keys.Down) && _previousKeyState.IsKeyUp(Keys.Down))
        {
            _selectedIndex = (_selectedIndex + 1) % _menuItems.Count;
        }
        
        if (keyState.IsKeyDown(Keys.Up) && _previousKeyState.IsKeyUp(Keys.Up))
        {
            _selectedIndex = (_selectedIndex - 1 + _menuItems.Count) % _menuItems.Count;
        }
        
        // Select option
        if (keyState.IsKeyDown(Keys.Enter) && _previousKeyState.IsKeyUp(Keys.Enter))
        {
            HandleSelection();
        }
        
        _previousKeyState = keyState;
    }
    
    private void HandleSelection()
    {
        switch (_selectedIndex)
        {
            case 0: // New Game
                StateManager.ChangeState(new GameplayState(Game, SpriteBatch));
                break;
            case 1: // Load Game
                // Handle load
                break;
            case 2: // Options
                StateManager.PushState(new OptionsState(Game, SpriteBatch));
                break;
            case 3: // Exit
                Game.Exit();
                break;
        }
    }
    
    public override void Draw(GameTime gameTime)
    {
        Game.GraphicsDevice.Clear(Color.Black);
        
        SpriteBatch.Begin();
        
        for (int i = 0; i < _menuItems.Count; i++)
        {
            Color color = (i == _selectedIndex) ? Color.Yellow : Color.White;
            Vector2 position = new Vector2(100, 100 + i * 50);
            SpriteBatch.DrawString(_font, _menuItems[i], position, color);
        }
        
        SpriteBatch.End();
    }
}
```

## Integration with Game Class

```csharp
public class Game1 : Game
{
    private GraphicsDeviceManager _graphics;
    private SpriteBatch _spriteBatch;
    private GameStateManager _stateManager;
    
    protected override void Initialize()
    {
        _stateManager = new GameStateManager();
        base.Initialize();
    }
    
    protected override void LoadContent()
    {
        _spriteBatch = new SpriteBatch(GraphicsDevice);
        _stateManager.PushState(new MenuState(this, _spriteBatch));
    }
    
    protected override void Update(GameTime gameTime)
    {
        _stateManager.Update(gameTime);
        base.Update(gameTime);
    }
    
    protected override void Draw(GameTime gameTime)
    {
        _stateManager.Draw(gameTime);
        base.Draw(gameTime);
    }
}
```

## Source

Based on MonoGame community best practices and game development patterns.
