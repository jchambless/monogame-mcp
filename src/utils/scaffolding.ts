/**
 * MonoGame Code Scaffolding Utility
 * 
 * Provides 8 concrete code templates for rapid C# MonoGame code generation.
 * Each template generates valid, compilable C# code following MonoGame conventions.
 */

import { ScaffoldTemplate } from '../types.js';

/**
 * Template definitions with C# code patterns
 */
const TEMPLATES: Record<string, ScaffoldTemplate> = {
  'game-class': {
    name: 'game-class',
    description: 'Complete Game1.cs with constructor, Initialize, LoadContent, Update, Draw',
    category: 'Core',
    template: `using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace {{namespace}}
{
    public class {{className}} : Game
    {
        private GraphicsDeviceManager _graphics;
        private SpriteBatch _spriteBatch;

        public {{className}}()
        {
            _graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
            IsMouseVisible = true;
        }

        protected override void Initialize()
        {
            // TODO: Add your initialization logic here
            base.Initialize();
        }

        protected override void LoadContent()
        {
            _spriteBatch = new SpriteBatch(GraphicsDevice);
            
            // TODO: use this.Content to load your game content here
        }

        protected override void Update(GameTime gameTime)
        {
            if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed || 
                Keyboard.GetState().IsKeyDown(Keys.Escape))
                Exit();

            // TODO: Add your update logic here

            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue);

            // TODO: Add your drawing code here

            base.Draw(gameTime);
        }
    }
}`,
    parameters: ['className', 'namespace']
  },

  'drawable-component': {
    name: 'drawable-component',
    description: 'DrawableGameComponent subclass for renderable game components',
    category: 'Components',
    template: `using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace {{namespace}}
{
    public class {{className}} : DrawableGameComponent
    {
        private SpriteBatch _spriteBatch;

        public {{className}}(Game game) : base(game)
        {
        }

        public override void Initialize()
        {
            base.Initialize();
        }

        protected override void LoadContent()
        {
            _spriteBatch = new SpriteBatch(GraphicsDevice);
            base.LoadContent();
        }

        public override void Update(GameTime gameTime)
        {
            // TODO: Add your update logic here
            base.Update(gameTime);
        }

        public override void Draw(GameTime gameTime)
        {
            _spriteBatch.Begin();
            
            // TODO: Add your drawing code here
            
            _spriteBatch.End();
            base.Draw(gameTime);
        }
    }
}`,
    parameters: ['className', 'namespace']
  },

  'game-component': {
    name: 'game-component',
    description: 'GameComponent subclass for non-drawable game logic',
    category: 'Components',
    template: `using Microsoft.Xna.Framework;

namespace {{namespace}}
{
    public class {{className}} : GameComponent
    {
        public {{className}}(Game game) : base(game)
        {
        }

        public override void Initialize()
        {
            base.Initialize();
        }

        public override void Update(GameTime gameTime)
        {
            // TODO: Add your component logic here
            base.Update(gameTime);
        }
    }
}`,
    parameters: ['className', 'namespace']
  },

  'input-handler': {
    name: 'input-handler',
    description: 'Static input handling class with state tracking for keyboard, mouse, gamepad',
    category: 'Input',
    template: `using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;

namespace {{namespace}}
{
    public static class {{className}}
    {
        private static KeyboardState _previousKeyState;
        private static KeyboardState _currentKeyState;
        private static MouseState _previousMouseState;
        private static MouseState _currentMouseState;
        private static GamePadState _previousPadState;
        private static GamePadState _currentPadState;

        public static void Update()
        {
            _previousKeyState = _currentKeyState;
            _currentKeyState = Keyboard.GetState();
            
            _previousMouseState = _currentMouseState;
            _currentMouseState = Mouse.GetState();
            
            _previousPadState = _currentPadState;
            _currentPadState = GamePad.GetState(PlayerIndex.One);
        }

        public static bool IsKeyPressed(Keys key)
        {
            return _currentKeyState.IsKeyDown(key) && _previousKeyState.IsKeyUp(key);
        }

        public static bool IsKeyDown(Keys key)
        {
            return _currentKeyState.IsKeyDown(key);
        }

        public static bool IsLeftMouseButtonPressed()
        {
            return _currentMouseState.LeftButton == ButtonState.Pressed && 
                   _previousMouseState.LeftButton == ButtonState.Released;
        }

        public static Vector2 GetMousePosition()
        {
            return new Vector2(_currentMouseState.X, _currentMouseState.Y);
        }

        public static bool IsButtonPressed(Buttons button)
        {
            return _currentPadState.IsButtonDown(button) && _previousPadState.IsButtonUp(button);
        }

        public static Vector2 GetLeftThumbStick()
        {
            return _currentPadState.ThumbSticks.Left;
        }
    }
}`,
    parameters: ['className', 'namespace']
  },

  'sprite-animation': {
    name: 'sprite-animation',
    description: 'Sprite sheet animation class with frame management and time-based progression',
    category: 'Graphics',
    template: `using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace {{namespace}}
{
    public class {{className}}
    {
        private Texture2D _spriteSheet;
        private int _frameWidth;
        private int _frameHeight;
        private int _currentFrame;
        private int _totalFrames;
        private float _timePerFrame;
        private float _timeElapsed;

        public {{className}}(Texture2D spriteSheet, int frameWidth, int frameHeight, 
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

        public void Reset()
        {
            _currentFrame = 0;
            _timeElapsed = 0;
        }
    }
}`,
    parameters: ['className', 'namespace']
  },

  'scene-manager': {
    name: 'scene-manager',
    description: 'Scene/screen manager with push/pop/switch pattern for game states',
    category: 'State Management',
    template: `using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Content;

namespace {{namespace}}
{
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

    public class {{className}}
    {
        private Stack<GameState> _states;
        private GameState _currentState;

        public {{className}}()
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
}`,
    parameters: ['className', 'namespace']
  },

  'collision-helper': {
    name: 'collision-helper',
    description: 'Static collision detection helpers for AABB and circle collisions',
    category: 'Physics',
    template: `using Microsoft.Xna.Framework;

namespace {{namespace}}
{
    public static class {{className}}
    {
        /// <summary>
        /// Check collision between two rectangles (AABB)
        /// </summary>
        public static bool CheckRectangleCollision(Rectangle rectA, Rectangle rectB)
        {
            return rectA.Intersects(rectB);
        }

        /// <summary>
        /// Check collision between two circles
        /// </summary>
        public static bool CheckCircleCollision(Vector2 centerA, float radiusA, 
                                               Vector2 centerB, float radiusB)
        {
            float distance = Vector2.Distance(centerA, centerB);
            return distance < (radiusA + radiusB);
        }

        /// <summary>
        /// Check if a point is inside a rectangle
        /// </summary>
        public static bool PointInRectangle(Point point, Rectangle rectangle)
        {
            return rectangle.Contains(point);
        }

        /// <summary>
        /// Check if a point is inside a circle
        /// </summary>
        public static bool PointInCircle(Vector2 point, Vector2 center, float radius)
        {
            float distance = Vector2.Distance(point, center);
            return distance <= radius;
        }

        /// <summary>
        /// Calculate intersection depth between two rectangles
        /// </summary>
        public static Vector2 GetIntersectionDepth(Rectangle rectA, Rectangle rectB)
        {
            // Calculate half sizes
            float halfWidthA = rectA.Width / 2.0f;
            float halfHeightA = rectA.Height / 2.0f;
            float halfWidthB = rectB.Width / 2.0f;
            float halfHeightB = rectB.Height / 2.0f;

            // Calculate centers
            Vector2 centerA = new Vector2(rectA.Left + halfWidthA, rectA.Top + halfHeightA);
            Vector2 centerB = new Vector2(rectB.Left + halfWidthB, rectB.Top + halfHeightB);

            // Calculate distance between centers
            float distanceX = centerA.X - centerB.X;
            float distanceY = centerA.Y - centerB.Y;
            float minDistanceX = halfWidthA + halfWidthB;
            float minDistanceY = halfHeightA + halfHeightB;

            // If not intersecting, return zero
            if (MathHelper.Abs(distanceX) >= minDistanceX || MathHelper.Abs(distanceY) >= minDistanceY)
                return Vector2.Zero;

            // Calculate and return intersection depths
            float depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
            float depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;

            return new Vector2(depthX, depthY);
        }
    }
}`,
    parameters: ['className', 'namespace']
  },

  'audio-manager': {
    name: 'audio-manager',
    description: 'Audio management class for sound effects and background music',
    category: 'Audio',
    template: `using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Audio;
using Microsoft.Xna.Framework.Media;

namespace {{namespace}}
{
    public class {{className}}
    {
        private Dictionary<string, SoundEffect> _soundEffects;
        private Dictionary<string, Song> _songs;
        private Song _currentSong;
        private float _masterVolume;
        private float _sfxVolume;
        private float _musicVolume;

        public {{className}}()
        {
            _soundEffects = new Dictionary<string, SoundEffect>();
            _songs = new Dictionary<string, Song>();
            _masterVolume = 1.0f;
            _sfxVolume = 1.0f;
            _musicVolume = 1.0f;
        }

        public void LoadSoundEffect(string name, SoundEffect soundEffect)
        {
            _soundEffects[name] = soundEffect;
        }

        public void LoadSong(string name, Song song)
        {
            _songs[name] = song;
        }

        public void PlaySoundEffect(string name, float volume = 1.0f, float pitch = 0.0f, float pan = 0.0f)
        {
            if (_soundEffects.ContainsKey(name))
            {
                float adjustedVolume = volume * _sfxVolume * _masterVolume;
                adjustedVolume = MathHelper.Clamp(adjustedVolume, 0f, 1f);
                _soundEffects[name].Play(adjustedVolume, pitch, pan);
            }
        }

        public void PlaySong(string name, bool repeat = true)
        {
            if (_songs.ContainsKey(name))
            {
                _currentSong = _songs[name];
                MediaPlayer.IsRepeating = repeat;
                MediaPlayer.Volume = _musicVolume * _masterVolume;
                MediaPlayer.Play(_currentSong);
            }
        }

        public void PauseMusic()
        {
            if (MediaPlayer.State == MediaState.Playing)
            {
                MediaPlayer.Pause();
            }
        }

        public void ResumeMusic()
        {
            if (MediaPlayer.State == MediaState.Paused)
            {
                MediaPlayer.Resume();
            }
        }

        public void StopMusic()
        {
            MediaPlayer.Stop();
        }

        public void SetMasterVolume(float volume)
        {
            _masterVolume = MathHelper.Clamp(volume, 0f, 1f);
            MediaPlayer.Volume = _musicVolume * _masterVolume;
        }

        public void SetSfxVolume(float volume)
        {
            _sfxVolume = MathHelper.Clamp(volume, 0f, 1f);
        }

        public void SetMusicVolume(float volume)
        {
            _musicVolume = MathHelper.Clamp(volume, 0f, 1f);
            MediaPlayer.Volume = _musicVolume * _masterVolume;
        }
    }
}`,
    parameters: ['className', 'namespace']
  }
};

/**
 * Generate C# code from a template with parameter substitution
 * @param templateName Name of the template to use
 * @param params Parameters to substitute in the template
 * @returns Object with filename and generated C# code content
 * @throws Error if template is not found
 */
export function generateCode(
  templateName: string,
  params: Record<string, string>
): { filename: string; content: string } {
  const template = TEMPLATES[templateName];
  
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }

  // Simple string replacement for {{placeholder}} syntax
  let content = template.template;
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }

  // Generate filename from className parameter
  const filename = `${params.className}.cs`;

  return { filename, content };
}

/**
 * List all available templates with metadata
 * @returns Array of all scaffold templates
 */
export function listTemplates(): ScaffoldTemplate[] {
  return Object.values(TEMPLATES);
}
