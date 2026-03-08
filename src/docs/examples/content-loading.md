# Content Loading

Patterns for loading and managing game assets through the MonoGame Content Pipeline.

## Basic Content Loading

```csharp
public class Game1 : Game
{
    private Texture2D _playerTexture;
    private SpriteFont _font;
    private SoundEffect _sound;
    private Song _music;
    
    public Game1()
    {
        Content.RootDirectory = "Content";
    }
    
    protected override void LoadContent()
    {
        // Load various content types
        _playerTexture = Content.Load<Texture2D>("Textures/player");
        _font = Content.Load<SpriteFont>("Fonts/Arial");
        _sound = Content.Load<SoundEffect>("Audio/explosion");
        _music = Content.Load<Song>("Music/background");
    }
    
    protected override void UnloadContent()
    {
        Content.Unload();
        base.UnloadContent();
    }
}
```

## Texture2D.FromStream (Loading Without Content Pipeline)

```csharp
using System.IO;

protected override void LoadContent()
{
    // Load image directly from file without MGCB
    using (FileStream stream = File.OpenRead("Content/logo.png"))
    {
        _logoTexture = Texture2D.FromStream(GraphicsDevice, stream);
    }
}
```

## Content Manager per Category

```csharp
public class Game1 : Game
{
    private ContentManager _uiContent;
    private ContentManager _levelContent;
    
    protected override void Initialize()
    {
        base.Initialize();
        
        // Create separate content managers
        _uiContent = new ContentManager(Services, "Content");
        _levelContent = new ContentManager(Services, "Content");
    }
    
    private void LoadLevel(int levelNumber)
    {
        // Unload previous level content
        _levelContent.Unload();
        
        // Load new level content
        Texture2D background = _levelContent.Load<Texture2D>($"Levels/Level{levelNumber}/background");
        Texture2D tileset = _levelContent.Load<Texture2D>($"Levels/Level{levelNumber}/tileset");
    }
    
    protected override void UnloadContent()
    {
        _uiContent.Unload();
        _levelContent.Unload();
        Content.Unload();
    }
}
```

## Resource Manager with Caching

```csharp
public class ResourceManager
{
    private static ResourceManager _instance;
    public static ResourceManager Instance => _instance ??= new ResourceManager();
    
    private ContentManager _content;
    private Dictionary<string, object> _cache;
    
    private ResourceManager()
    {
        _cache = new Dictionary<string, object>();
    }
    
    public void Initialize(ContentManager content)
    {
        _content = content;
    }
    
    public T Load<T>(string assetName)
    {
        if (_cache.ContainsKey(assetName))
        {
            return (T)_cache[assetName];
        }
        
        T asset = _content.Load<T>(assetName);
        _cache[assetName] = asset;
        return asset;
    }
    
    public void Unload(string assetName)
    {
        if (_cache.ContainsKey(assetName))
        {
            _cache.Remove(assetName);
        }
    }
    
    public void UnloadAll()
    {
        _cache.Clear();
        _content.Unload();
    }
}

// Usage:
protected override void Initialize()
{
    base.Initialize();
    ResourceManager.Instance.Initialize(Content);
}

protected override void LoadContent()
{
    _playerTexture = ResourceManager.Instance.Load<Texture2D>("Textures/player");
}
```

## Source

Based on MonoGame documentation: https://docs.monogame.net/articles/getting_to_know/howto/content_pipeline/
