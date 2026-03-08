# Audio Playback

Complete patterns for playing sound effects and music in MonoGame.

## Loading Audio Assets

```csharp
private SoundEffect _explosionSound;
private SoundEffect _laserSound;
private SoundEffectInstance _engineSound;
private Song _backgroundMusic;

protected override void LoadContent()
{
    // Load sound effects (WAV format recommended)
    _explosionSound = Content.Load<SoundEffect>("Audio/explosion");
    _laserSound = Content.Load<SoundEffect>("Audio/laser");
    
    // Create instance for looping/controlled sounds
    SoundEffect engineEffect = Content.Load<SoundEffect>("Audio/engine");
    _engineSound = engineEffect.CreateInstance();
    _engineSound.IsLooped = true;
    _engineSound.Volume = 0.3f;
    _engineSound.Pitch = -0.5f; // Range: -1.0 to 1.0
    _engineSound.Pan = 0.0f;    // Range: -1.0 (left) to 1.0 (right)
    
    // Load background music (MP3, OGG recommended)
    _backgroundMusic = Content.Load<Song>("Music/background");
    MediaPlayer.IsRepeating = true;
    MediaPlayer.Volume = 0.5f;
    MediaPlayer.Play(_backgroundMusic);
}
```

## Simple Sound Effect Playback

```csharp
protected override void Update(GameTime gameTime)
{
    if (Keyboard.GetState().IsKeyDown(Keys.Space))
    {
        // Fire and forget playback
        _laserSound.Play(volume: 0.8f, pitch: 0.0f, pan: 0.0f);
    }
    
    base.Update(gameTime);
}
```

## Looping Sound Effects

```csharp
protected override void Update(GameTime gameTime)
{
    if (Keyboard.GetState().IsKeyDown(Keys.E))
    {
        // Start looping engine sound
        if (_engineSound.State != SoundState.Playing)
            _engineSound.Play();
    }
    else
    {
        // Stop engine sound
        if (_engineSound.State == SoundState.Playing)
            _engineSound.Stop();
    }
    
    base.Update(gameTime);
}
```

## Positional Audio (Distance-Based Volume)

```csharp
protected override void Update(GameTime gameTime)
{
    // Calculate distance between player and sound source
    float distance = Vector2.Distance(_playerPosition, _enemyPosition);
    
    // Calculate volume based on distance (1000 = max hearing distance)
    float volume = MathHelper.Clamp(1.0f - (distance / 1000f), 0f, 1f);
    
    // Play with calculated volume
    if (_shouldPlayEnemySound)
        _explosionSound.Play(volume, 0f, 0f);
    
    base.Update(gameTime);
}
```

## Stereo Panning Based on Position

```csharp
protected override void Update(GameTime gameTime)
{
    // Calculate pan based on relative position
    float relativeX = _soundSourcePosition.X - _playerPosition.X;
    float screenWidth = GraphicsDevice.Viewport.Width;
    
    // Pan: -1.0 (left) to 1.0 (right)
    float pan = MathHelper.Clamp(relativeX / (screenWidth / 2f), -1f, 1f);
    
    _explosionSound.Play(volume: 0.8f, pitch: 0f, pan: pan);
    
    base.Update(gameTime);
}
```

## Background Music Management

```csharp
public class MusicManager
{
    private Song _currentSong;
    private float _targetVolume = 0.5f;
    private float _fadeSpeed = 1.0f;
    
    public void PlaySong(Song song, bool fadeIn = false)
    {
        if (_currentSong == song && MediaPlayer.State == MediaState.Playing)
            return;
        
        _currentSong = song;
        
        if (fadeIn)
        {
            MediaPlayer.Volume = 0f;
        }
        else
        {
            MediaPlayer.Volume = _targetVolume;
        }
        
        MediaPlayer.IsRepeating = true;
        MediaPlayer.Play(song);
    }
    
    public void Update(GameTime gameTime)
    {
        // Fade in
        if (MediaPlayer.Volume < _targetVolume)
        {
            MediaPlayer.Volume = Math.Min(
                MediaPlayer.Volume + _fadeSpeed * (float)gameTime.ElapsedGameTime.TotalSeconds,
                _targetVolume
            );
        }
    }
    
    public void FadeOut(float speed = 1.0f)
    {
        _fadeSpeed = -speed;
    }
    
    public void Pause()
    {
        MediaPlayer.Pause();
    }
    
    public void Resume()
    {
        MediaPlayer.Resume();
    }
    
    public void Stop()
    {
        MediaPlayer.Stop();
    }
}
```

## Audio Controller with Pools

```csharp
public class AudioController
{
    private Dictionary<string, SoundEffect> _soundEffects;
    private List<SoundEffectInstance> _activeInstances;
    private const int MAX_INSTANCES = 32;
    
    public AudioController()
    {
        _soundEffects = new Dictionary<string, SoundEffect>();
        _activeInstances = new List<SoundEffectInstance>();
    }
    
    public void LoadSound(string name, SoundEffect sound)
    {
        _soundEffects[name] = sound;
    }
    
    public void PlaySound(string name, float volume = 1.0f, float pitch = 0f, float pan = 0f)
    {
        if (!_soundEffects.ContainsKey(name))
            return;
        
        // Clean up stopped instances
        _activeInstances.RemoveAll(i => i.State == SoundState.Stopped);
        
        // Limit concurrent sounds
        if (_activeInstances.Count >= MAX_INSTANCES)
            _activeInstances[0].Stop();
        
        var instance = _soundEffects[name].CreateInstance();
        instance.Volume = volume;
        instance.Pitch = pitch;
        instance.Pan = pan;
        instance.Play();
        
        _activeInstances.Add(instance);
    }
    
    public void StopAll()
    {
        foreach (var instance in _activeInstances)
        {
            instance.Stop();
        }
        _activeInstances.Clear();
    }
    
    public void Dispose()
    {
        StopAll();
        foreach (var instance in _activeInstances)
        {
            instance.Dispose();
        }
    }
}
```

## Source

Based on MonoGame documentation: https://docs.monogame.net/articles/getting_to_know/whatis/audio/
