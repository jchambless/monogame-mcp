# SoundEffectInstance

**Namespace:** Microsoft.Xna.Framework.Audio

## Summary

`SoundEffectInstance` provides advanced control over sound playback including looping, pause/resume, and real-time property changes.

## Inheritance

`Object` → `SoundEffectInstance`

## Properties

| Property | Type | Description |
|----------|------|-------------|
| IsLooped | bool | Gets or sets whether the sound loops |
| Volume | float | Volume (0.0 to 1.0) |
| Pitch | float | Pitch adjustment (-1.0 to 1.0) |
| Pan | float | Stereo pan (-1.0 to 1.0) |
| State | SoundState | Current playback state (Playing, Paused, Stopped) |

## Methods

### Play()

Starts or resumes playback.

### Pause()

Pauses playback.

### Stop()

Stops playback.

## Code Examples

### Looping Engine Sound

```csharp
private SoundEffectInstance _engineSound;

protected override void LoadContent()
{
    SoundEffect engineEffect = Content.Load<SoundEffect>("Audio/engine");
    _engineSound = engineEffect.CreateInstance();
    _engineSound.IsLooped = true;
    _engineSound.Volume = 0.3f;
    _engineSound.Pitch = -0.5f;
}

protected override void Update(GameTime gameTime)
{
    if (Keyboard.GetState().IsKeyDown(Keys.E))
    {
        if (_engineSound.State != SoundState.Playing)
            _engineSound.Play();
    }
    else
    {
        if (_engineSound.State == SoundState.Playing)
            _engineSound.Stop();
    }
}
```

## Related Classes

- [SoundEffect](soundeffect.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Audio.SoundEffectInstance.html
