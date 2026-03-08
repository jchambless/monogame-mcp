# Song

**Namespace:** Microsoft.Xna.Framework.Media

## Summary

`Song` represents streamed music. Use for long background music tracks.

## Code Example

```csharp
private Song _backgroundMusic;

protected override void LoadContent()
{
    _backgroundMusic = Content.Load<Song>("Music/background");
    MediaPlayer.IsRepeating = true;
    MediaPlayer.Volume = 0.5f;
    MediaPlayer.Play(_backgroundMusic);
}
```

## Related Classes

- [MediaPlayer](mediaplayer.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Media.Song.html
