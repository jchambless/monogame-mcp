# SoundEffect

**Namespace:** Microsoft.Xna.Framework.Audio

## Summary

`SoundEffect` represents a loaded sound that can be played. Best for short sound effects. Use `Song` for longer music tracks.

## Inheritance

`Object` → `SoundEffect`

## Methods

### Play()

Plays the sound effect once ("fire and forget").

### Play(float volume, float pitch, float pan)

Plays the sound with specified volume, pitch, and pan.

**Parameters:**
- `volume`: Volume (0.0 to 1.0)
- `pitch`: Pitch adjustment (-1.0 to 1.0)
- `pan`: Stereo pan (-1.0 = left, 0 = center, 1.0 = right)

### CreateInstance()

Creates a SoundEffectInstance for looping or advanced control.

**Returns:** SoundEffectInstance

## Code Examples

### Simple Playback

```csharp
private SoundEffect _explosionSound;
private SoundEffect _laserSound;

protected override void LoadContent()
{
    _explosionSound = Content.Load<SoundEffect>("Audio/explosion");
    _laserSound = Content.Load<SoundEffect>("Audio/laser");
}

protected override void Update(GameTime gameTime)
{
    if (Keyboard.GetState().IsKeyDown(Keys.Space))
    {
        // Fire and forget playback
        _laserSound.Play(volume: 0.8f, pitch: 0.0f, pan: 0.0f);
    }
}
```

### Positional Audio

```csharp
// Dynamic volume based on distance
float distance = Vector2.Distance(_playerPosition, _enemyPosition);
float volume = MathHelper.Clamp(1.0f - (distance / 1000f), 0f, 1f);
_explosionSound.Play(volume, 0f, 0f);
```

## Related Classes

- [SoundEffectInstance](soundeffectinstance.md)
- [Song](song.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Audio.SoundEffect.html
