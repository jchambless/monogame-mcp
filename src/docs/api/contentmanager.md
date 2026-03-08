# ContentManager

**Namespace:** Microsoft.Xna.Framework.Content

## Summary

`ContentManager` handles loading and unloading of game assets (textures, sounds, models, fonts) processed by the MonoGame Content Pipeline.

## Inheritance

`Object` → `ContentManager`

## Constructors

### ContentManager(IServiceProvider serviceProvider)

Creates a new ContentManager instance.

### ContentManager(IServiceProvider serviceProvider, string rootDirectory)

Creates a new ContentManager with a specified root directory.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| RootDirectory | string | Root directory for content files (default: "Content") |
| ServiceProvider | IServiceProvider | Service provider for loading content |

## Methods

### Load<T>(string assetName)

Loads a compiled asset by name. The asset path is relative to `RootDirectory` without file extension.

**Type Parameter:**
- `T`: Type of asset (Texture2D, SpriteFont, SoundEffect, Song, Model, Effect)

**Parameters:**
- `assetName`: Asset path without extension (e.g., "Textures/player" for "Textures/player.xnb")

**Returns:** Loaded asset of type T

### Unload()

Unloads all assets loaded by this ContentManager instance. Important for memory management.

## Code Examples

### Loading Various Asset Types

```csharp
protected override void LoadContent()
{
    _spriteBatch = new SpriteBatch(GraphicsDevice);

    // Load various content types
    Texture2D texture = Content.Load<Texture2D>("Textures/player");
    SpriteFont font = Content.Load<SpriteFont>("Fonts/Arial");
    SoundEffect sound = Content.Load<SoundEffect>("Audio/explosion");
    Song music = Content.Load<Song>("Music/background");
    Model model3D = Content.Load<Model>("Models/spaceship");
    Effect shader = Content.Load<Effect>("Shaders/custom");
}

protected override void UnloadContent()
{
    Content.Unload();
    base.UnloadContent();
}
```

### Using Custom Content Directory

```csharp
public static ContentManager LibContent;

public GameLibComponent(Game game, string contentDirectory) : base(game)
{
    LibContent = new ContentManager(game.Services);
    LibContent.RootDirectory = contentDirectory;
}

protected override void LoadContent()
{
    Texture2D libTexture = LibContent.Load<Texture2D>("mytexture");
}
```

## Related Classes

- [Game](game.md)
- [Texture2D](texture2d.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Content.ContentManager.html
