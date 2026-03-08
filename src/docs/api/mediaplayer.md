# MediaPlayer

**Namespace:** Microsoft.Xna.Framework.Media

## Summary

`MediaPlayer` provides static methods for playing background music (Song objects).

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Volume | float | Playback volume (0.0 to 1.0) |
| IsRepeating | bool | Whether to loop the current song |
| State | MediaState | Current playback state |

## Methods

### Play(Song song)

Plays the specified song.

### Pause()

Pauses playback.

### Resume()

Resumes playback.

### Stop()

Stops playback.

## Code Example

```csharp
Song music = Content.Load<Song>("Music/background");
MediaPlayer.IsRepeating = true;
MediaPlayer.Volume = 0.5f;
MediaPlayer.Play(music);
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Media.MediaPlayer.html
